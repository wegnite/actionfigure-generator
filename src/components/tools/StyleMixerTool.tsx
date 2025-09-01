/**
 * Style Mixer Tool Component
 * 艺术风格混合工具组件
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Palette, Shuffle, Save, Download, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const artStyles = [
  { id: 'anime', name: 'Anime/Manga', color: 'bg-pink-500' },
  { id: 'realistic', name: 'Realistic', color: 'bg-blue-500' },
  { id: 'cartoon', name: 'Cartoon', color: 'bg-green-500' },
  { id: 'comic', name: 'Comic Book', color: 'bg-red-500' },
  { id: 'fantasy', name: 'Fantasy Art', color: 'bg-purple-500' },
  { id: 'scifi', name: 'Sci-Fi', color: 'bg-cyan-500' },
  { id: 'steampunk', name: 'Steampunk', color: 'bg-amber-500' },
  { id: 'minimalist', name: 'Minimalist', color: 'bg-gray-500' },
  { id: 'baroque', name: 'Baroque', color: 'bg-yellow-600' },
  { id: 'impressionist', name: 'Impressionist', color: 'bg-indigo-500' },
];

export default function StyleMixerTool() {
  const { toast } = useToast();
  const [primaryStyle, setPrimaryStyle] = useState('');
  const [secondaryStyle, setSecondaryStyle] = useState('');
  const [mixRatio, setMixRatio] = useState([50]);
  const [mixedStyleName, setMixedStyleName] = useState('');
  const [savedMixes, setSavedMixes] = useState<any[]>([]);

  const generateMix = () => {
    if (!primaryStyle || !secondaryStyle) {
      toast({
        title: "请选择风格",
        description: "请选择主要风格和次要风格后再混合",
        variant: "destructive"
      });
      return;
    }

    const primary = artStyles.find(s => s.id === primaryStyle);
    const secondary = artStyles.find(s => s.id === secondaryStyle);
    
    if (primary && secondary) {
      const generatedName = `${primary.name} × ${secondary.name} (${mixRatio[0]}:${100-mixRatio[0]})`;
      setMixedStyleName(generatedName);
      
      toast({
        title: "风格混合完成",
        description: "已生成新的混合风格！",
      });
    }
  };

  const saveMix = () => {
    if (!mixedStyleName) {
      toast({
        title: "没有可保存的混合",
        description: "请先生成风格混合",
        variant: "destructive"
      });
      return;
    }

    const newMix = {
      name: mixedStyleName,
      primary: primaryStyle,
      secondary: secondaryStyle,
      ratio: mixRatio[0],
      timestamp: Date.now()
    };

    setSavedMixes(prev => [newMix, ...prev.slice(0, 9)]);
    toast({
      title: "混合已保存",
      description: "风格混合已添加到收藏",
    });
  };

  const randomMix = () => {
    const availableStyles = artStyles.filter(s => s.id !== primaryStyle && s.id !== secondaryStyle);
    
    const randomPrimary = artStyles[Math.floor(Math.random() * artStyles.length)];
    const randomSecondary = availableStyles[Math.floor(Math.random() * availableStyles.length)];
    const randomRatio = [Math.floor(Math.random() * 80) + 20]; // 20-80%
    
    setPrimaryStyle(randomPrimary.id);
    setSecondaryStyle(randomSecondary.id);
    setMixRatio(randomRatio);
    
    toast({
      title: "随机混合生成",
      description: "已生成随机风格组合！",
    });
  };

  const getPrimaryStyle = () => artStyles.find(s => s.id === primaryStyle);
  const getSecondaryStyle = () => artStyles.find(s => s.id === secondaryStyle);

  return (
    <div className="space-y-8">
      {/* 风格选择区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Style Selection & Mixing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 主要和次要风格选择 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Primary Style (主风格)</Label>
                <Select value={primaryStyle} onValueChange={setPrimaryStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择主风格" />
                  </SelectTrigger>
                  <SelectContent>
                    {artStyles.map(style => (
                      <SelectItem key={style.id} value={style.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${style.color}`} />
                          {style.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getPrimaryStyle() && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getPrimaryStyle()?.color}`} />
                      <span className="font-medium">{getPrimaryStyle()?.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Secondary Style (辅助风格)</Label>
                <Select value={secondaryStyle} onValueChange={setSecondaryStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择辅助风格" />
                  </SelectTrigger>
                  <SelectContent>
                    {artStyles.filter(s => s.id !== primaryStyle).map(style => (
                      <SelectItem key={style.id} value={style.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${style.color}`} />
                          {style.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getSecondaryStyle() && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getSecondaryStyle()?.color}`} />
                      <span className="font-medium">{getSecondaryStyle()?.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 混合比例控制 */}
            <div>
              <Label className="text-sm font-medium mb-4 block">
                Mixing Ratio (混合比例): {mixRatio[0]}% - {100 - mixRatio[0]}%
              </Label>
              <div className="px-4">
                <Slider
                  value={mixRatio}
                  onValueChange={setMixRatio}
                  max={90}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>主风格占比</span>
                  <span>辅助风格占比</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={generateMix}
                className="cf-gradient-primary text-white flex-1"
              >
                <Palette className="w-4 h-4 mr-2" />
                Generate Mix
              </Button>
              
              <Button onClick={randomMix} variant="outline">
                <Shuffle className="w-4 h-4 mr-2" />
                Random
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 混合结果 */}
      {mixedStyleName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Mixed Style Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 视觉化混合比例 */}
              <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${getPrimaryStyle()?.color} opacity-80 transition-all`}
                  style={{ width: `${mixRatio[0]}%` }}
                />
                <div
                  className={`absolute top-0 right-0 h-full ${getSecondaryStyle()?.color} opacity-80`}
                  style={{ width: `${100 - mixRatio[0]}%` }}
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{mixedStyleName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This mix combines the distinctive characteristics of {getPrimaryStyle()?.name} 
                  with elements from {getSecondaryStyle()?.name} at a {mixRatio[0]}:{100-mixRatio[0]} ratio.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveMix} variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Mix
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 保存的混合 */}
      {savedMixes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Style Mixes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {savedMixes.map((mix, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <h4 className="font-medium mb-2">{mix.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded flex-1">
                      <div
                        className="h-full bg-blue-500 rounded"
                        style={{ width: `${mix.ratio}%` }}
                      />
                    </div>
                    <span>{mix.ratio}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}