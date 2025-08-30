/**
 * Character Figure Gallery Component
 * 
 * Problem: Users need inspiration and social proof of what's possible
 * Solution: Dynamic gallery showcasing community creations
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Download, Share2, Eye } from 'lucide-react';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  author: string;
  authorAvatar: string;
  likes: number;
  views: number;
  createdAt: string;
}

// Character Figure Gallery - Real examples showcasing the platform's capabilities
const MOCK_GALLERY: GalleryItem[] = [
  {
    id: '1',
    imageUrl: '/imgs/showcases/1.png',
    prompt: 'Spider-Man action figure with web shooters and articulated joints',
    style: 'figure',
    author: 'MarvelFan2024',
    authorAvatar: '/imgs/users/1.png',
    likes: 234,
    views: 1200,
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    imageUrl: '/imgs/showcases/2.png',
    prompt: 'Goku Super Saiyan figure with energy effects and display base',
    style: 'anime',
    author: 'DBZCollector',
    authorAvatar: '/imgs/users/2.png',
    likes: 189,
    views: 890,
    createdAt: '5 hours ago',
  },
  {
    id: '3',
    imageUrl: '/imgs/showcases/3.png',
    prompt: 'Wonder Woman action figure with golden lasso and shield',
    style: 'figure',
    author: 'DCHeroes',
    authorAvatar: '/imgs/users/3.png',
    likes: 456,
    views: 2340,
    createdAt: '1 day ago',
  },
  {
    id: '4',
    imageUrl: '/imgs/showcases/4.png',
    prompt: 'Totoro figure in Ghibli style with forest accessories',
    style: 'ghibli',
    author: 'GhibliLover',
    authorAvatar: '/imgs/users/4.png',
    likes: 321,
    views: 1567,
    createdAt: '1 day ago',
  },
  {
    id: '5',
    imageUrl: '/imgs/showcases/5.png',
    prompt: 'Iron Man Mark 85 figure with LED arc reactor and repulsors',
    style: 'figure',
    author: 'TechHero',
    authorAvatar: '/imgs/users/5.png',
    likes: 278,
    views: 1234,
    createdAt: '2 days ago',
  },
  {
    id: '6',
    imageUrl: '/imgs/showcases/6.png',
    prompt: 'Pikachu figure with lightning effects and Pokeball base',
    style: 'anime',
    author: 'PokeMaster',
    authorAvatar: '/imgs/users/6.png',
    likes: 412,
    views: 1890,
    createdAt: '3 days ago',
  },
  {
    id: '7',
    imageUrl: '/imgs/showcases/7.png',
    prompt: 'Batman figure with cape and batarang accessories',
    style: 'figure',
    author: 'GothamGuardian',
    authorAvatar: '/imgs/users/7.png',
    likes: 167,
    views: 745,
    createdAt: '3 days ago',
  },
  {
    id: '8',
    imageUrl: '/imgs/showcases/8.png',
    prompt: 'Naruto figure with rasengan effect and ninja headband',
    style: 'anime',
    author: 'NinjaArt',
    authorAvatar: '/imgs/users/8.png',
    likes: 298,
    views: 1456,
    createdAt: '4 days ago',
  },
  {
    id: '9',
    imageUrl: '/imgs/showcases/9.png',
    prompt: 'Princess Mononoke figure with mask and forest spirit',
    style: 'ghibli',
    author: 'ForestSpirit',
    authorAvatar: '/imgs/users/9.png',
    likes: 203,
    views: 987,
    createdAt: '5 days ago',
  },
];

export default function CharacterFigureGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>(MOCK_GALLERY);
  const [filter, setFilter] = useState<string>('all');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  
  const handleLike = (id: string) => {
    setLikedItems(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(id)) {
        newLikes.delete(id);
        setGallery(items => 
          items.map(item => 
            item.id === id ? { ...item, likes: item.likes - 1 } : item
          )
        );
      } else {
        newLikes.add(id);
        setGallery(items => 
          items.map(item => 
            item.id === id ? { ...item, likes: item.likes + 1 } : item
          )
        );
      }
      return newLikes;
    });
  };
  
  const filteredGallery = filter === 'all' 
    ? gallery 
    : gallery.filter(item => item.style === filter);
  
  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          All Styles
        </Button>
        {['ghibli', 'figure', 'anime', 'oil', 'watercolor', 'pixel'].map(style => (
          <Button
            key={style}
            variant={filter === style ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(style)}
            className={filter === style ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {style.charAt(0).toUpperCase() + style.slice(1)}
          </Button>
        ))}
      </div>
      
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGallery.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Image Container */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 group overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.prompt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  // Fallback to gradient background if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Fallback content if image fails to load */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-yellow-200 dark:from-orange-800 dark:to-yellow-800 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center font-medium">
                  {item.prompt}
                </p>
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => handleLike(item.id)}
                >
                  <Heart 
                    className={`w-5 h-5 ${likedItems.has(item.id) ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Style Badge */}
              <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-full text-xs font-medium">
                {item.style}
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-4">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.authorAvatar}
                    alt={item.author}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Hide failed avatar image, show gradient background
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Fallback initial */}
                  <span className="text-white text-xs font-semibold">
                    {item.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{item.author}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.createdAt}</p>
                </div>
              </div>
              
              {/* Prompt */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {item.prompt}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{item.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{item.views}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Load More Button */}
      <div className="text-center pt-8">
        <Button
          variant="outline"
          size="lg"
          className="min-w-[200px]"
        >
          Load More Creations
        </Button>
      </div>
    </div>
  );
}