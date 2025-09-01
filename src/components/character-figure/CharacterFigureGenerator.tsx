/**
 * Action Figure Generator Component
 * 
 * Problem: Complex UI for image generation needs to be simple and intuitive
 * Solution: Step-by-step interface with clear visual feedback
 * 
 * Core functionality:
 * - Image upload with preview
 * - Style selection grid
 * - Parameter adjustment
 * - Real-time generation status
 * - Full internationalization support
 */

'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload, Download, Share2, RefreshCw, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAppContext } from '@/contexts/app';
import { useTranslations } from 'next-intl';

interface GeneratorProps {
  locale: string;
}

export default function CharacterFigureGenerator({ locale }: GeneratorProps) {
  // Translations
  const t = useTranslations('generator');
  
  // Authentication and context
  const { data: session } = useSession();
  const { setShowSignModal } = useAppContext();
  
  // State management
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('figure');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('hd');
  const [numImages, setNumImages] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generationTab, setGenerationTab] = useState('upload');
  
  // Style presets with their descriptions
  const STYLE_PRESETS = [
    { id: 'ghibli', icon: '🏯' },
    { id: 'figure', icon: '🎭' },
    { id: 'anime', icon: '✨' },
    { id: 'oil', icon: '🎨' },
    { id: 'watercolor', icon: '💧' },
    { id: 'pixel', icon: '🎮' },
    { id: 'none', icon: '📷' },
  ];

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t('generation.errors.fileSize'),
          description: t('generation.errors.fileSizeDesc'),
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [t]);
  
  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  // Handle generation
  const handleGenerate = async () => {
    // Check user authentication
    if (!session) {
      toast({
        title: t('generation.errors.authRequired'),
        description: t('generation.errors.authRequiredDesc'),
        variant: 'destructive',
        action: (
          <Button
            size="sm"
            onClick={() => setShowSignModal(true)}
            className="ml-auto"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {t('authentication.signInAndGenerate')}
          </Button>
        ),
      });
      setShowSignModal(true);
      return;
    }
    
    if (generationTab === 'upload' && !uploadedImage && !prompt) {
      toast({
        title: t('generation.errors.missingInput'),
        description: t('generation.errors.missingInputDesc'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Build the generation prompt based on style
      let fullPrompt = prompt || '';
      
      if (selectedStyle === 'figure') {
        fullPrompt = `Turn this into an action figure. Behind it, place a box with the character's image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the action figure standing on it. Set the scene indoors. ${prompt}`;
      } else if (selectedStyle === 'ghibli') {
        fullPrompt = `Transform in Studio Ghibli anime style, with soft watercolor backgrounds, whimsical atmosphere, and Hayao Miyazaki's signature artistic touch. ${prompt}`;
      } else if (selectedStyle === 'anime') {
        fullPrompt = `Convert to high-quality anime art style with vibrant colors, expressive eyes, and dynamic composition. ${prompt}`;
      }
      
      const response = await fetch('/api/nano-banana/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          negative_prompt: negativePrompt,
          input_image: uploadedImage,
          style: selectedStyle,
          aspect_ratio: aspectRatio,
          num_images: numImages,
          quality: quality,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setShowSignModal(true);
          toast({
            title: t('generation.errors.authRequired'),
            description: data.error || t('generation.errors.authRequiredDesc'),
            variant: 'destructive',
          });
        } else if (data.error && data.error.includes('credits')) {
          toast({
            title: t('generation.errors.insufficientCredits'),
            description: data.error || t('generation.errors.insufficientCreditsDesc'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('generation.errors.generationFailed'),
            description: data.error || t('generation.errors.generationFailedDesc'),
            variant: 'destructive',
          });
        }
        return;
      }
      
      setGeneratedImages(data.images || []);
      
      toast({
        title: t('generation.success'),
        description: t('generation.successDescription', { count: data.images?.length || 1 }),
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: t('generation.errors.generationError'),
        description: t('generation.errors.generationErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="relative text-white min-h-[800px] overflow-hidden">
      {/* Background Effects - Fixed z-index */}
      <div className="absolute inset-0 action-figure-bg rounded-lg -z-10"></div>
      
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-30 rounded-lg -z-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full action-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full action-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
        <div className="absolute bottom-1/3 right-2/3 w-2 h-2 bg-purple-400 rounded-full action-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 action-figure-noise rounded-lg -z-10"></div>

      <div className="relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-3 lg:px-4">
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            
            {/* Left Panel - Input Controls */}
            <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 action-figure-border shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-lg"></div>
              <div className="absolute inset-0 border border-orange-400/20 rounded-lg action-pulse"></div>

              <div className="relative p-4 border-b-2 border-orange-500/30">
                <h2 className="text-lg font-black text-orange-300 action-figure-title drop-shadow-lg">
                  {t('inputSettings.title')}
                </h2>
              </div>

              <div className="relative p-4 space-y-4">
            
                {/* Input Tabs */}
                <Tabs value={generationTab} onValueChange={setGenerationTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-orange-500/30">
                    <TabsTrigger 
                      value="upload" 
                      className="data-[state=active]:bg-orange-600 data-[state=active]:text-white action-figure-body"
                    >
                      {t('inputSettings.tabs.imageToImage')}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="text" 
                      className="data-[state=active]:bg-orange-600 data-[state=active]:text-white action-figure-body"
                    >
                      {t('inputSettings.tabs.textToImage')}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-3 mt-4">
                    <label className="block text-xs font-bold text-orange-200 mb-2 tracking-wider action-figure-body">
                      {t('inputSettings.upload.title')}
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-orange-500/50 rounded-lg p-4 text-center hover:border-orange-400/70 transition-colors cursor-pointer bg-gray-800/30"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      {uploadedImage ? (
                        <div className="relative">
                          <img
                            src={uploadedImage}
                            alt="Uploaded"
                            className="max-w-full h-auto rounded-lg mx-auto max-h-32 border border-orange-500/30"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImage(null);
                            }}
                          >
                            {t('inputSettings.upload.remove')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-6 h-6 text-orange-400 mx-auto" />
                          <p className="text-sm text-orange-300 action-figure-body">{t('inputSettings.upload.dragDrop')}</p>
                          <p className="text-xs text-gray-400 action-figure-body">{t('inputSettings.upload.subtitle')}</p>
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="text" className="space-y-3 mt-4">
                    <label className="block text-xs font-bold text-orange-200 mb-2 tracking-wider action-figure-body">
                      {t('inputSettings.mainPrompt.label')}
                    </label>
                    <Textarea
                      placeholder={t('inputSettings.mainPrompt.placeholder')}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[80px] bg-gray-800/50 border-orange-500/30 text-white action-figure-body resize-none text-sm"
                    />
                  </TabsContent>
                </Tabs>

                {/* Negative Prompt */}
                <div>
                  <label className="block text-xs font-bold text-orange-200 mb-2 tracking-wider action-figure-body">
                    {t('inputSettings.negativePrompt.label')}
                  </label>
                  <Textarea
                    placeholder={t('inputSettings.negativePrompt.placeholder')}
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[60px] bg-gray-800/50 border-orange-500/30 text-white action-figure-body resize-none text-sm"
                  />
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-bold text-orange-200 mb-2 tracking-wider action-figure-body">
                    {t('advancedSettings.aspectRatio.label')}
                  </label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="bg-gray-800/50 border-orange-500/30 text-white action-figure-body">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-orange-500/30">
                      {Object.entries(t.raw('advancedSettings.aspectRatio.options')).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-white hover:bg-orange-600/20">
                          {label as string}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Images & Quality in same row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-orange-200 mb-2 tracking-wider action-figure-body">
                      {t('advancedSettings.numImages.label')}
                    </label>
                    <Select value={numImages} onValueChange={setNumImages}>
                      <SelectTrigger className="bg-gray-800/50 border-orange-500/30 text-white action-figure-body text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-orange-500/30">
                        {Object.entries(t.raw('advancedSettings.numImages.options')).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-white hover:bg-orange-600/20">
                            {label as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-orange-200 mb-2 tracking-wider action-figure-body">
                      {t('advancedSettings.quality.label')}
                    </label>
                    <div className="flex items-center justify-center">
                      <RadioGroup value={quality} onValueChange={setQuality} className="flex space-x-3">
                        {Object.entries(t.raw('advancedSettings.quality.options')).map(([value, label]) => (
                          <div key={value} className="flex items-center space-x-1">
                            <RadioGroupItem value={value} id={value} className="border-orange-500 w-3 h-3" />
                            <Label htmlFor={value} className="text-orange-300 action-figure-body text-xs">
                              {label as string}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                {!session && (
                  <div className="mb-2 p-2 bg-orange-900/20 border border-orange-500/30 rounded-lg text-xs text-orange-300 action-figure-body">
                    <LogIn className="inline-block mr-1 h-3 w-3" />
                    {t('authentication.required')}
                  </div>
                )}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 hover:from-orange-500 hover:via-red-500 hover:to-orange-500 text-white font-black py-4 text-base tracking-wider shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 action-figure-border hover:border-orange-300 action-figure-glow action-figure-title"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('generation.generating')}</span>
                    </div>
                  ) : !session ? (
                    <div className="flex items-center space-x-2">
                      <LogIn className="w-5 h-5" />
                      <span>{t('authentication.signInAndGenerate')}</span>
                    </div>
                  ) : (
                    t('generation.generateNow')
                  )}
                </Button>
              </div>
            </Card>

            {/* Style Selection Panel */}
            <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 action-figure-border shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-lg"></div>
              <div className="absolute inset-0 border border-orange-400/20 rounded-lg action-pulse"></div>

              <div className="relative p-4 border-b-2 border-orange-500/30">
                <h3 className="text-base font-black text-orange-300 action-figure-title drop-shadow-lg">
                  {t('styleSelection.title')}
                </h3>
              </div>

              <div className="relative p-4">
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-2 rounded-lg border-2 transition-all hover:shadow-md action-figure-body ${
                        selectedStyle === style.id
                          ? 'border-orange-500 bg-orange-900/30 text-orange-300'
                          : 'border-gray-600 hover:border-orange-400 text-gray-400 hover:text-orange-300'
                      }`}
                    >
                      <div className="text-base mb-1">{style.icon}</div>
                      <div className="text-xs font-bold tracking-wider">
                        {t(`styleSelection.styles.${style.id}.name`)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Generated Output Panel */}
            <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 action-figure-border shadow-2xl backdrop-blur-sm min-h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-lg"></div>
              <div className="absolute inset-0 border border-orange-400/20 rounded-lg action-pulse"></div>

              <div className="relative p-4 border-b-2 border-orange-500/30">
                <h2 className="text-lg font-black text-white action-figure-title drop-shadow-lg flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  {t('outputGallery.title')}
                </h2>
              </div>

              <div className="relative p-4">
                {generatedImages.length > 0 ? (
                  <div className="space-y-6">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="border border-orange-500/30 rounded-lg overflow-hidden bg-gray-800/30">
                          <img
                            src={image}
                            alt={`Generated Action Figure ${index + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = image;
                              a.download = `action-figure-${Date.now()}.png`;
                              a.click();
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => {
                              navigator.share?.({
                                title: 'Check out my AI Action Figure!',
                                text: 'Created with Action Figure Generator',
                                url: window.location.href,
                              });
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white action-figure-title"
                      onClick={() => handleGenerate()}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t('outputGallery.actions.generateMore')}
                    </Button>
                  </div>
                ) : (
                  <div className="relative h-full flex flex-col items-center justify-center text-center py-20 overflow-hidden">
                    {/* Animated Background Grid */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(rgba(234,88,12,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(234,88,12,0.3) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        animation: 'gridMove 20s linear infinite'
                      }}></div>
                    </div>
                    
                    {/* Scanning Lines */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent action-scan"></div>
                      <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent action-scan" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    {/* Floating Particles */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
                      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                      <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
                    </div>
                    
                    {/* Central Hub */}
                    <div className="relative z-10">
                      {/* Core Reactor */}
                      <div className="relative w-32 h-32 mb-8">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 border-2 border-orange-500/50 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
                        <div className="absolute inset-2 border border-cyan-400/30 rounded-full animate-spin" style={{animationDuration: '6s', animationDirection: 'reverse'}}></div>
                        <div className="absolute inset-4 border border-yellow-400/20 rounded-full animate-spin" style={{animationDuration: '4s'}}></div>
                        
                        {/* Core */}
                        <div className="absolute inset-8 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center action-pulse shadow-2xl">
                          <div className="w-8 h-8 bg-white rounded-full action-glow"></div>
                        </div>
                        
                        {/* Energy Beams */}
                        <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-gradient-to-r from-orange-500 to-transparent" style={{transform: 'translateY(-50%)'}}></div>
                        <div className="absolute top-1/2 right-0 w-4 h-0.5 bg-gradient-to-l from-orange-500 to-transparent" style={{transform: 'translateY(-50%)'}}></div>
                        <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-gradient-to-b from-orange-500 to-transparent" style={{transform: 'translateX(-50%)'}}></div>
                        <div className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-gradient-to-t from-orange-500 to-transparent" style={{transform: 'translateX(-50%)'}}></div>
                      </div>
                      
                      {/* Status Display */}
                      <div className="relative mb-6">
                        <h3 className="text-2xl font-black mb-2 text-orange-300 action-figure-title drop-shadow-lg">
                          <span className="inline-block animate-pulse">{'>'}</span> {t('outputGallery.empty.title')}
                        </h3>
                        <div className="flex justify-center items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                          <div className="text-green-400 text-xs font-bold tracking-wider action-figure-body">
                            {t('outputGallery.empty.subtitle')}
                          </div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                        </div>
                      </div>
                      
                      {/* Command Interface */}
                      <div className="bg-black/40 border border-orange-500/30 rounded-lg p-4 backdrop-blur-sm max-w-md mx-auto">
                        <p className="text-gray-300 action-figure-body text-sm mb-2">
                          <span className="text-orange-400">{'>'}</span> {t('outputGallery.empty.description')}
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full action-pulse"></div>
                            <span className="text-gray-400 action-figure-body">{t('outputGallery.empty.awaitCommand').split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full action-pulse" style={{animationDelay: '0.3s'}}></div>
                            <span className="text-gray-400 action-figure-body">{t('outputGallery.empty.awaitCommand').split(' ')[1]}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full action-pulse" style={{animationDelay: '0.6s'}}></div>
                            <span className="text-gray-400 action-figure-body">{t('outputGallery.empty.awaitCommand').split(' ')[2] + ' ' + t('outputGallery.empty.awaitCommand').split(' ')[3]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Corner Decorations */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-orange-500/50"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-orange-500/50"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-orange-500/50"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-orange-500/50"></div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}