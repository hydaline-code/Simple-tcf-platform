import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Save, X, PenTool, Mic, Image } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface Question {
  id: string;
  type: 'writing' | 'audio';
  title: string;
  content: string;
  imageUrl?: string;
  timeLimit: number;
  wordLimit?: number;
  subtasks?: Array<{
    id: number;
    title: string;
    instruction: string;
    suggestedWordCount?: string;
  }>;
}

export function AdminInterface() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'writing' as 'writing' | 'audio',
    title: '',
    content: '',
    imageUrl: '',
    timeLimit: 60,
    wordLimit: 400
  });

  // Subtasks for writing tasks
  const [subtasks, setSubtasks] = useState([
    { id: 1, title: 'Tâche 1', instruction: '', suggestedWordCount: '60-80 mots' },
    { id: 2, title: 'Tâche 2', instruction: '', suggestedWordCount: '120-150 mots' },
    { id: 3, title: 'Tâche 3', instruction: '', suggestedWordCount: '160-180 mots' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedQuestions = localStorage.getItem('tcf-questions');
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // For writing tasks, validate subtasks
    if (formData.type === 'writing') {
      const hasEmptySubtasks = subtasks.some(s => !s.instruction.trim());
      if (hasEmptySubtasks) {
        alert('Veuillez remplir toutes les instructions des sous-tâches');
        return;
      }
    }

    const questionData: Question = {
      ...formData,
      id: editingId || Date.now().toString(),
      ...(formData.type === 'writing' ? { subtasks } : { subtasks: undefined, wordLimit: undefined })
    };

    let updatedQuestions;
    if (editingId) {
      updatedQuestions = questions.map(q => q.id === editingId ? questionData : q);
    } else {
      updatedQuestions = [...questions, questionData];
    }

    localStorage.setItem('tcf-questions', JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'writing',
      title: '',
      content: '',
      imageUrl: '',
      timeLimit: 60,
      wordLimit: 400
    });
    setSubtasks([
      { id: 1, title: 'Tâche 1', instruction: '', suggestedWordCount: '60-80 mots' },
      { id: 2, title: 'Tâche 2', instruction: '', suggestedWordCount: '120-150 mots' },
      { id: 3, title: 'Tâche 3', instruction: '', suggestedWordCount: '160-180 mots' }
    ]);
    setIsCreating(false);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (question: Question) => {
    setFormData({
      type: question.type,
      title: question.title,
      content: question.content,
      imageUrl: question.imageUrl || '',
      timeLimit: question.timeLimit,
      wordLimit: question.wordLimit || 400
    });

    if (question.type === 'writing' && question.subtasks) {
      setSubtasks(question.subtasks.map(st => ({
        id: st.id,
        title: st.title,
        instruction: st.instruction,
        suggestedWordCount: st.suggestedWordCount || ''
      })));
    }

    setEditingId(question.id);
    setIsCreating(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, imageUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette tâche ?')) {
      const updatedQuestions = questions.filter(q => q.id !== id);
      localStorage.setItem('tcf-questions', JSON.stringify(updatedQuestions));
      setQuestions(updatedQuestions);
    }
  };

  const updateSubtask = (index: number, field: string, value: string) => {
    const updated = subtasks.map((subtask, i) => 
      i === index ? { ...subtask, [field]: value } : subtask
    );
    setSubtasks(updated);
  };

  const writingQuestions = questions.filter(q => q.type === 'writing');
  const audioQuestions = questions.filter(q => q.type === 'audio');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Administration TCF Canada</h2>
          <p className="text-gray-600">Créer et gérer les tâches</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier' : 'Créer'} une tâche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Type de tâche</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'writing' | 'audio') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="writing">Expression écrite (3 sous-tâches)</SelectItem>
                    <SelectItem value="audio">Expression orale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Durée (minutes)</Label>
                <Input
                  type="number"
                  min="30"
                  max="120"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    timeLimit: parseInt(e.target.value) || 60 
                  })}
                />
              </div>
            </div>

            <div>
              <Label>Titre</Label>
              <Input
                placeholder="Expression écrite - Environnement"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Contexte général</Label>
              <Textarea
                placeholder="Décrivez le sujet ou le document de référence..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div>
              <Label>Image (optionnel)</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img src={formData.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="mt-2"
                  >
                    Supprimer
                  </Button>
                </div>
              )}
            </div>

            {/* Subtasks for writing */}
            {formData.type === 'writing' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Configuration des 3 sous-tâches</h3>
                <Alert className="mb-4">
                  <AlertDescription>
                    Définissez les 3 tâches que l'étudiant doit accomplir avec un seul chronomètre.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  {subtasks.map((subtask, index) => (
                    <Card key={subtask.id} className="p-4">
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>Titre</Label>
                            <Input
                              value={subtask.title}
                              onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                              placeholder={`Tâche ${subtask.id}`}
                            />
                          </div>
                          <div>
                            <Label>Mots suggérés</Label>
                            <Input
                              value={subtask.suggestedWordCount}
                              onChange={(e) => updateSubtask(index, 'suggestedWordCount', e.target.value)}
                              placeholder="60-80 mots"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Consigne</Label>
                          <Textarea
                            value={subtask.instruction}
                            onChange={(e) => updateSubtask(index, 'instruction', e.target.value)}
                            placeholder={`Instructions pour ${subtask.title}...`}
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Modifier' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            Total: {questions.length} tâches ({writingQuestions.length} écrites, {audioQuestions.length} orales)
          </AlertDescription>
        </Alert>

        {/* Writing Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-green-600" />
              Expression écrite ({writingQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {writingQuestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune tâche écrite</p>
            ) : (
              <div className="space-y-4">
                {writingQuestions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{question.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{question.content.substring(0, 100)}...</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">⏱️ {question.timeLimit} min</Badge>
                          {question.wordLimit && <Badge variant="secondary">📝 {question.wordLimit} mots</Badge>}
                        </div>
                        
                        {question.subtasks && (
                          <div className="mt-2 text-sm text-gray-500">
                            Sous-tâches: {question.subtasks.map(s => s.title).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(question.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audio Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-600" />
              Expression orale ({audioQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {audioQuestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune tâche orale</p>
            ) : (
              <div className="space-y-4">
                {audioQuestions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{question.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{question.content.substring(0, 100)}...</p>
                        <Badge variant="secondary">⏱️ {question.timeLimit} min</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(question.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}