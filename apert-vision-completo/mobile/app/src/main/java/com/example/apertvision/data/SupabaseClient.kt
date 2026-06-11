package com.example.apertvision.data

import com.example.apertvision.BuildConfig
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage

/**
 * Cliente Supabase global. Se construye una sola vez al arrancar la app.
 * Las credenciales vienen inyectadas vía BuildConfig desde local.properties.
 */
object SupabaseClient {
    val client = createSupabaseClient(
        supabaseUrl = BuildConfig.SUPABASE_URL,
        supabaseKey = BuildConfig.SUPABASE_KEY,
    ) {
        install(Auth)
        install(Postgrest)
        install(Storage)
    }
}
