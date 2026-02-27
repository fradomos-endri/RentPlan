import { supabase } from './supabase';

// ============= USERS =============

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role;
}

// ============= CARS =============

export async function getCarsForBusiness(businessId: number) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function addCar(businessId: number, carData: any) {
  const { data, error } = await supabase
    .from('cars')
    .insert([
      {
        business_id: businessId,
        brand: carData.brand,
        model: carData.model,
        production_year: carData.production_year,
        engine: carData.engine,
        transmission: carData.transmission,
        fuel_type: carData.fuel_type,
        kilometers: carData.kilometers || 0,
        color: carData.color,
        plate: carData.plate,
        description: carData.description,
        price_per_day: carData.price_per_day,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function updateCar(carId: number, carData: any) {
  const { data, error } = await supabase
    .from('cars')
    .update({
      brand: carData.brand,
      model: carData.model,
      production_year: carData.production_year,
      engine: carData.engine,
      transmission: carData.transmission,
      fuel_type: carData.fuel_type,
      kilometers: carData.kilometers,
      color: carData.color,
      plate: carData.plate,
      description: carData.description,
      price_per_day: carData.price_per_day,
      updated_at: new Date().toISOString(),
    })
    .eq('car_id', carId)
    .select()
    .single();

  return { data, error };
}

export async function deleteCar(carId: number) {
  const { data, error } = await supabase
    .from('cars')
    .delete()
    .eq('car_id', carId);

  return { data, error };
}

// ============= CAR IMAGES =============

export async function uploadCarImage(carId: number, file: File) {
  const fileName = `car-${carId}-${Date.now()}.jpg`;
  const filePath = `cars/${fileName}`;

  const { data, error: uploadError } = await supabase.storage
    .from('car-images')
    .upload(filePath, file);

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  // Get public URL
  const { data: publicUrl } = supabase.storage
    .from('car-images')
    .getPublicUrl(filePath);

  // Save image reference to database
  const { data: imageData, error: dbError } = await supabase
    .from('car_images')
    .insert([
      {
        car_id: carId,
        image_url: publicUrl.publicUrl,
        is_cover: true, // Set as cover image
      },
    ])
    .select()
    .single();

  return { data: imageData, error: dbError };
}

export async function getCarImages(carId: number) {
  const { data, error } = await supabase
    .from('car_images')
    .select('*')
    .eq('car_id', carId)
    .order('is_cover', { ascending: false });

  return { data, error };
}

export async function deleteCarImage(imageId: number) {
  const { data, error } = await supabase
    .from('car_images')
    .delete()
    .eq('image_id', imageId);

  return { data, error };
}

// ============= BOOKINGS =============

export async function getBookingsForCar(carId: number) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('car_id', carId)
    .order('start_date', { ascending: false });

  return { data, error };
}

export async function getBookingsForBusiness(businessId: number) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(car_id, brand, model), users(full_name, email)')
    .in('car_id', 
      await supabase
        .from('cars')
        .select('car_id')
        .eq('business_id', businessId)
        .then(res => res.data?.map(c => c.car_id) || [])
    );

  return { data, error };
}

export async function createBooking(userId: number, carId: number, startDate: string, endDate: string, totalPrice: number) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        user_id: userId,
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        status: 'pending',
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function updateBookingStatus(bookingId: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('booking_id', bookingId)
    .select()
    .single();

  return { data, error };
}

export async function deleteBooking(bookingId: number) {
  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('booking_id', bookingId);

  return { data, error };
}

// ============= BUSINESSES =============

export async function getBusiness(userId: number) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function createBusiness(userId: number, businessName: string, vatNumber?: string) {
  const { data, error } = await supabase
    .from('businesses')
    .insert([
      {
        user_id: userId,
        business_name: businessName,
        vat_number: vatNumber,
      },
    ])
    .select()
    .single();

  return { data, error };
}

// ============= SUPER ADMIN =============

export async function getAllBusinesses() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*, users(full_name, email)')
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getAllBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(brand, model), users(full_name, email)')
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function approveOrRejectBusiness(userId: number, action: 'approve' | 'reject') {
  const role = action === 'approve' ? 'business' : 'user';
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}
