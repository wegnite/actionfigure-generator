/**
 * Prompt Generator Tool Component
 * 提示词生成工具组件
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Download, 
  Settings,
  Palette,
  User,
  Camera,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// 预定义的风格选项
const styles = [
  'Anime/Manga', 'Realistic', 'Cartoon', 'Comic Book', 'Fantasy', 
  'Sci-Fi', 'Steampunk', 'Cyberpunk', 'Medieval', 'Modern'
];

const poses = [
  'Action Pose', 'Standing', 'Sitting', 'Fighting', 'Dancing', 
  'Flying', 'Jumping', 'Crouching', 'Running', 'Heroic'
];

const emotions = [
  'Happy', 'Serious', 'Angry', 'Calm', 'Excited', 
  'Mysterious', 'Confident', 'Determined', 'Playful', 'Fierce'
];

const qualityModifiers = [
  'highly detailed', 'professional quality', '8k resolution', 
  'studio lighting', 'perfect anatomy', 'award winning', 
  'masterpiece', 'photorealistic', 'ultra realistic'
];

export default function PromptGeneratorTool() {
  const { toast } = useToast();
  const [characterName, setCharacterName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedPose, setSelectedPose] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  // 生成提示词
  const generatePrompt = () => {
    const parts = [];
    
    if (characterName) {
      parts.push(`A ${characterName} character`);
    } else {
      parts.push('An action figure character');
    }

    if (selectedStyle) {
      parts.push(`in ${selectedStyle} style`);
    }

    if (selectedPose) {
      parts.push(`in a ${selectedPose.toLowerCase()}`);
    }

    if (selectedEmotion) {
      parts.push(`with a ${selectedEmotion.toLowerCase()} expression`);
    }

    if (customDetails) {
      parts.push(customDetails);
    }

    // 添加质量修饰符
    if (selectedModifiers.length > 0) {
      parts.push(selectedModifiers.join(', '));
    }

    const prompt = parts.join(', ') + '.';
    setGeneratedPrompt(prompt);
    
    // 添加到历史记录
    setPromptHistory(prev => [prompt, ...prev.slice(0, 9)]);
    
    toast({
      title: "提示词已生成",
      description: "已为您生成优化的AI提示词！",
    });
  };

  // 复制提示词
  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "已复制",
      description: "提示词已复制到剪贴板！",
    });
  };

  // 处理修饰符选择
  const handleModifierChange = (modifier: string, checked: boolean) => {
    if (checked) {
      setSelectedModifiers(prev => [...prev, modifier]);
    } else {
      setSelectedModifiers(prev => prev.filter(m => m !== modifier));
    }
  };

  // 重置表单
  const resetForm = () => {
    setCharacterName('');
    setSelectedStyle('');
    setSelectedPose('');
    setSelectedEmotion('');
    setCustomDetails('');
    setSelectedModifiers([]);
    setGeneratedPrompt('');
  };

  return (
    <div className="space-y-8">
      {/* 配置区域 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Prompt Configuration
            </CardTitle>
            <Button variant="outline" size="sm" onClick={resetForm}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 基础信息 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="character-name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Character Name/Type
                </Label>
                <Input
                  id="character-name"
                  placeholder="e.g., superhero, warrior princess, robot"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Art Style
                  </Label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map(style => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Pose
                  </Label>
                  <Select value={selectedPose} onValueChange={setSelectedPose}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select pose" />
                    </SelectTrigger>
                    <SelectContent>
                      {poses.map(pose => (
                        <SelectItem key={pose} value={pose}>{pose}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Emotion</Label>
                  <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      {emotions.map(emotion => (
                        <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="custom-details">Custom Details</Label>
                <Textarea
                  id="custom-details"
                  placeholder="Add specific details about clothing, accessories, background, etc."
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* 质量修饰符 */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" />
                Quality Modifiers
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {qualityModifiers.map(modifier => (
                  <div key={modifier} className="flex items-center space-x-2">
                    <Checkbox
                      id={modifier}
                      checked={selectedModifiers.includes(modifier)}
                      onCheckedChange={(checked) => 
                        handleModifierChange(modifier, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={modifier}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {modifier}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={generatePrompt} 
              className="w-full cf-gradient-primary text-white"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Optimized Prompt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 结果区域 */}
      {generatedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generated Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{generatedPrompt}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyPrompt} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Prompt
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      {promptHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {promptHistory.map((prompt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <p className="text-sm flex-1 truncate">{prompt}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(prompt)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}