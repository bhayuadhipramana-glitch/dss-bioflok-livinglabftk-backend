<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        \App\Models\Pond::insert([
            [
                'name' => 'Kolam Bioflok Alpha',
                'location' => 'Blok A1',
                'capacity_m3' => 10.5,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kolam Bioflok Beta',
                'location' => 'Blok A2',
                'capacity_m3' => 15.0,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kolam Bioflok Gamma',
                'location' => 'Blok B1',
                'capacity_m3' => 20.0,
                'status' => 'maintenance',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
