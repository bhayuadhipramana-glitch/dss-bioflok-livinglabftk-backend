<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedLog extends Model
{
    protected $fillable = ['pond_id', 'feed_type', 'amount_gram', 'notes'];

    public function pond()
    {
        return $this->belongsTo(Pond::class);
    }
}