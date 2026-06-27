<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // 1. TAMBAHKAN INI

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // 2. TAMBAHKAN HasApiTokens DI SINI

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // 3. TAMBAHKAN INI
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}