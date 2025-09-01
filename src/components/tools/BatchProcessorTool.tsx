/**
 * Batch Processor Tool Component
 * 批量处理工具组件
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Layers, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BatchJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  prompt: string;
  style: string;
  createdAt: Date;
}

const batchTemplates = [
  {
    id: 'superhero-series',
    name: 'Superhero Series',
    description: 'Create a series of superhero action figures with different powers',
    prompts: [
      'A fire-powered superhero action figure with flame effects',
      'An ice-powered superhero action figure with crystal armor',
      'An electric superhero action figure with lightning effects',
      'A nature superhero action figure with plant elements'
    ]
  },
  {
    id: 'fantasy-warriors',
    name: 'Fantasy Warriors',
    description: 'Generate various fantasy warrior action figures',
    prompts: [
      'A medieval knight action figure with sword and shield',
      'An elven archer action figure with magical bow',
      'A dwarven warrior action figure with battle axe',
      'A wizard action figure with staff and spell effects'
    ]
  },
  {
    id: 'anime-collection',
    name: 'Anime Collection',
    description: 'Create anime-style action figure collection',
    prompts: [
      'Anime schoolgirl action figure in uniform',
      'Anime mecha pilot action figure with helmet',
      'Anime ninja action figure with weapons',
      'Anime magical girl action figure with wand'
    ]
  }
];

export default function BatchProcessorTool() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customPrompts, setCustomPrompts] = useState('');
  const [batchName, setBatchName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('anime');
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const handleTemplateSelect = (templateId: string) => {
    const template = batchTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomPrompts(template.prompts.join('\n'));
      setBatchName(template.name);
    }
  };

  const startBatchProcess = async () => {
    if (!customPrompts.trim()) {
      toast({
        title: "请输入提示词",
        description: "请添加至少一个提示词后开始批量处理",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentProgress(0);

    const prompts = customPrompts.split('\n').filter(p => p.trim());
    const jobs: BatchJob[] = prompts.map((prompt, index) => ({
      id: `job-${Date.now()}-${index}`,
      name: `${batchName || 'Batch Job'} #${index + 1}`,
      status: 'pending',
      progress: 0,
      prompt: prompt.trim(),
      style: selectedStyle,
      createdAt: new Date()
    }));

    setBatchJobs(jobs);

    // 模拟批量处理
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      // 更新作业状态为处理中
      setBatchJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'processing' } : j
      ));

      // 模拟处理进度
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setBatchJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, progress } : j
        ));
        
        setCurrentProgress(((i * 100 + progress) / (jobs.length * 100)) * 100);
      }

      // 随机决定成功或失败（90% 成功率）
      const success = Math.random() > 0.1;
      
      setBatchJobs(prev => prev.map(j => 
        j.id === job.id ? { 
          ...j, 
          status: success ? 'completed' : 'error',
          progress: 100
        } : j
      ));
    }

    setIsProcessing(false);
    toast({
      title: "批量处理完成",
      description: `已完成 ${prompts.length} 个作业的处理`,
    });
  };

  const pauseBatchProcess = () => {
    setIsProcessing(false);
    toast({
      title: "批量处理已暂停",
      description: "您可以稍后继续处理",
    });
  };

  const clearBatchJobs = () => {
    setBatchJobs([]);
    setCurrentProgress(0);
    setBatchName('');
    setCustomPrompts('');
    setSelectedTemplate('');
  };

  const getStatusIcon = (status: BatchJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BatchJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* 批量配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Batch Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 模板选择 */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Quick Templates</Label>
              <div className="grid md:grid-cols-3 gap-4">
                {batchTemplates.map(template => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedTemplate === template.id ? 'ring-2 ring-[var(--cf-orange-500)]' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {template.prompts.length} prompts
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* 自定义配置 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="batch-name">Batch Name</Label>
                <Input
                  id="batch-name"
                  placeholder="e.g., My Hero Collection"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Style</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anime">Anime/Manga</SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="prompts" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Prompts (one per line)
              </Label>
              <Textarea
                id="prompts"
                placeholder="Enter each prompt on a new line..."
                value={customPrompts}
                onChange={(e) => setCustomPrompts(e.target.value)}
                className="mt-1 h-32"
              />
              <p className="text-sm text-gray-500 mt-1">
                {customPrompts.split('\n').filter(p => p.trim()).length} prompts
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={startBatchProcess}
                disabled={isProcessing}
                className="cf-gradient-primary text-white flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Start Batch'}
              </Button>
              
              {isProcessing && (
                <Button onClick={pauseBatchProcess} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button onClick={clearBatchJobs} variant="outline">
                <Square className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 处理进度 */}
      {batchJobs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Batch Progress
              </CardTitle>
              <Badge className={isProcessing ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                {isProcessing ? 'Processing' : 'Completed'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(currentProgress)}%</span>
                </div>
                <Progress value={currentProgress} className="h-2" />
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {batchJobs.map((job, index) => (
                  <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(job.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{job.name}</span>
                        <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {job.prompt}
                      </p>
                      {job.status === 'processing' && (
                        <Progress value={job.progress} className="h-1 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计信息 */}
      {batchJobs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {batchJobs.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {batchJobs.filter(j => j.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {batchJobs.filter(j => j.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Processing</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {batchJobs.filter(j => j.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}