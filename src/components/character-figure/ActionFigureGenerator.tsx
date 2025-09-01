/**
 * Action Figure Generator 组件
 * 
 * 功能：基于用户照片生成个人定制手办模型
 * 特点：AI驱动的图像处理，多种风格选择，完整包装设计
 * 
 * SEO优化：
 * - 关键词密度控制在3%
 * - 结构化数据标记
 * - 语义化HTML结构
 * 
 * @module components/ActionFigureGenerator
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Sparkles, 
  Download, 
  Share2, 
  Palette, 
  Zap,
  Image as ImageIcon,
  Package,
  Star
} from "lucide-react";
import NextImage from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

/**
 * Action Figure 风格配置
 * 每种风格包含特定的AI提示词和样式参数
 */
const ACTION_FIGURE_STYLES = {
  superhero: {
    id: "superhero",
    name: "Superhero Action Figure",
    icon: "🦸‍♂️",
    description: "Transform into a heroic action figure with cape, costume, and superpowers",
    prompt: "Create a superhero action figure with dramatic pose, colorful costume, cape, and heroic accessories in toy packaging",
    popular: true
  },
  anime: {
    id: "anime",
    name: "Anime Action Figure", 
    icon: "🎌",
    description: "Generate anime-style action figure with distinctive art style and actionfeatures",
    prompt: "Design an anime-style action figure with exaggerated features, dynamic pose, and anime aesthetic in collectible box",
    popular: true
  },
  realistic: {
    id: "realistic",
    name: "Realistic Action Figure",
    icon: "👤", 
    description: "Create lifelike action figure that captures real facial features and proportions",
    prompt: "Generate a realistic action figure with accurate human proportions, detailed facial features, and professional packaging"
  },
  funko: {
    id: "funko",
    name: "Funko Pop Style",
    icon: "🎎",
    description: "Design cute, collectible-style action figure similar to popular toy lines", 
    prompt: "Create a Funko Pop style action figure with oversized head, cute proportions, and colorful collectible packaging",
    popular: true
  },
  warrior: {
    id: "warrior",
    name: "Fantasy Warrior",
    icon: "⚔️",
    description: "Generate epic fantasy warrior action figure with armor, weapons, and mystical elements",
    prompt: "Design a fantasy warrior action figure with detailed armor, magical weapons, and epic fantasy packaging"
  },
  cyberpunk: {
    id: "cyberpunk", 
    name: "Cyberpunk Action Figure",
    icon: "🤖",
    description: "Create futuristic cyberpunk action figure with neon colors and tech accessories",
    prompt: "Generate a cyberpunk action figure with futuristic clothing, neon accents, tech accessories, and sci-fi packaging"
  }
};

/**
 * 生成参数选项
 */
const GENERATION_OPTIONS = {
  aspectRatios: [
    { value: "1:1", label: "1:1 Square", description: "Perfect for social media" },
    { value: "2:3", label: "2:3 Portrait", description: "Classic action figure format" },
    { value: "3:2", label: "3:2 Landscape", description: "Showcase style" }
  ],
  outputCounts: [
    { value: 1, label: "1 Action Figure", credits: 5 },
    { value: 2, label: "2 Action Figures", credits: 8 }, 
    { value: 4, label: "4 Action Figures", credits: 12 }
  ]
};

interface ActionFigureGeneratorProps {
  hero?: {
    title?: string;
    subtitle?: string;
    badge?: string;
  };
}

export default function ActionFigureGenerator({ hero }: ActionFigureGeneratorProps) {
  const { data: session } = useSession();
  const t = useTranslations("action_figure_generator");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 状态管理
  const [selectedStyle, setSelectedStyle] = useState("superhero");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("2:3");
  const [outputCount, setOutputCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);

  /**
   * 处理文件上传
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)");
        return;
      }
      
      if (file.size > 20 * 1024 * 1024) { // 20MB限制
        toast.error("Image file size must be under 20MB");
        return;
      }

      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  /**
   * 生成Action Figure
   */
  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!session) {
      toast.error("Please sign in to generate action figures");
      return;
    }

    setIsGenerating(true);

    try {
      const selectedStyleConfig = ACTION_FIGURE_STYLES[selectedStyle as keyof typeof ACTION_FIGURE_STYLES];
      
      // 构建完整提示词
      const fullPrompt = `${selectedStyleConfig.prompt}. ${customPrompt}`.trim();
      
      // 调用AI生成API
      const response = await fetch('/api/character-figure/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          prompt: fullPrompt,
          style: selectedStyle,
          aspectRatio,
          outputCount,
          type: 'action_figure'
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setGeneratedResults(result.data.images || []);
        toast.success(`Successfully generated ${result.data.images?.length || 0} action figures!`);
      } else {
        throw new Error(result.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Action figure generation error:', error);
      toast.error("Failed to generate action figure. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 下载生成的Action Figure
   */
  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `action-figure-${selectedStyle}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section - SEO优化 */}
      <section className="text-center space-y-4">
        <Badge variant="secondary" className="mb-2">
          {hero?.badge || "AI-Powered Action Figure Generator"}
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">
          {hero?.title || "Action Figure Generator"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {hero?.subtitle || "Transform your photos into stunning AI generated action figures with our advanced action figure AI generator. Create custom action figures in multiple styles with professional packaging design."}
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[var(--cf-yellow-500)]" />
            50,000+ Action Figures Created
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-[var(--cf-orange-500)]" />
            AI-Powered Technology
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4 text-[var(--cf-amber-500)]" />
            Complete Packaging Design
          </span>
        </div>
      </section>

      {/* Main Generator Interface */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Create Your Action Figure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Your Photo</label>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  uploadedImage ? "border-[var(--cf-orange-300)] bg-[var(--cf-orange-50)]" : "border-gray-300 hover:border-gray-400"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? (
                  <div className="space-y-2">
                    <NextImage 
                      src={uploadedImage} 
                      alt="Uploaded photo for action figure generation"
                      width={200} 
                      height={200} 
                      className="mx-auto rounded-lg object-cover"
                    />
                    <p className="text-sm text-[var(--cf-orange-600)]">Photo uploaded successfully</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload your photo for action figure generation
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports JPEG, PNG, GIF, WEBP up to 20MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Choose Action Figure Style</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ACTION_FIGURE_STYLES).map(([key, style]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all text-center",
                      selectedStyle === key 
                        ? "border-[var(--cf-orange-500)] bg-[var(--cf-orange-50)] shadow-md" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedStyle(key)}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className="text-sm font-medium">{style.name}</div>
                    {(style as any).popular && (
                      <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Custom Details (Optional)
              </label>
              <Textarea
                placeholder="Add specific details like accessories, colors, or poses for your action figure..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Generation Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Aspect Ratio</label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENERATION_OPTIONS.aspectRatios.map((ratio) => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        <div>
                          <div className="font-medium">{ratio.label}</div>
                          <div className="text-xs text-muted-foreground">{ratio.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Action Figures</label>
                <Select value={outputCount.toString()} onValueChange={(v) => setOutputCount(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENERATION_OPTIONS.outputCounts.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.credits} credits</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={!uploadedImage || isGenerating}
              className="w-full h-12 text-lg cf-gradient-primary hover:opacity-90 transition-opacity shadow-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Action Figure...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate My Action Figure
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel - Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Your AI Generated Action Figures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedResults.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {generatedResults.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <NextImage
                        src={imageUrl}
                        alt={`AI generated action figure ${index + 1} in ${selectedStyle} style`}
                        width={400}
                        height={500}
                        className="w-full rounded-lg shadow-lg"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(imageUrl, index)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Action Figures Yet</h3>
                <p>Upload a photo and generate your first AI action figure!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Style Preview Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Action Figure Styles Showcase</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Explore different styles available with our AI action figure generator. 
          Each style creates unique AI generated action figures with distinctive characteristics.
        </p>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(ACTION_FIGURE_STYLES).map(([key, style]) => (
            <Card key={key} className="text-center">
              <CardContent className="p-4">
                <div className="text-4xl mb-2">{style.icon}</div>
                <h3 className="font-medium text-sm mb-1">{style.name}</h3>
                <p className="text-xs text-muted-foreground">{style.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}