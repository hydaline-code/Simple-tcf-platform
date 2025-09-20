import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Save, X, PenTool, Mic, Image, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { dbOperations, type Question } from '../lib/firebase';

export function AdminInterface() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'writing' as 'writing' | 'audio',
    title: '',
    content: '',
    imageUrl: '',
    timeLimit: 60,
    wordLimit: 400
  });

  const [subtasks, setSubtasks] = useState([
    { id: 1, title: 'Tâche 1', instruction: '', suggestedWordCount: '60-80 mots', imageUrl: '' },
    { id: 2, title: 'Tâche 2', instruction: '', suggestedWordCount: '120-150 mots', imageUrl: '' },
    { id: 3, title: 'Tâche 3', instruction: '', suggestedWordCount: '160-180 mots', imageUrl: '' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtaskFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const questionsData = await dbOperations.getQuestions();
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Erreur lors du chargement des questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.type === 'writing') {
      const hasEmptySubtasks = subtasks.some(s => !s.instruction.trim());
      if (hasEmptySubtasks) {
        alert('Veuillez remplir toutes les instructions des sous-tâches');
        return;
      }
    }

    setLoading(true);
    try {
      const questionData = {
        ...formData,
        ...(formData.type === 'writing' ? { subtasks } : { subtasks: undefined, wordLimit: undefined })
      };

      if (editingId) {
        await dbOperations.updateQuestion(editingId, questionData);
      } else {
        await dbOperations.saveQuestion(questionData);
      }

      await loadQuestions();
      resetForm();
      alert(editingId ? 'Tâche modifiée avec succès!' : 'Tâche créée avec succès!');
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
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
      { id: 1, title: 'Tâche 1', instruction: '', suggestedWordCount: '60-80 mots', imageUrl: '' },
      { id: 2, title: 'Tâche 2', instruction: '', suggestedWordCount: '120-150 mots', imageUrl: '' },
      { id: 3, title: 'Tâche 3', instruction: '', suggestedWordCount: '160-180 mots', imageUrl: '' }
    ]);
    setIsCreating(false);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    subtaskFileRefs.current.forEach(ref => {
      if (ref) ref.value = '';
    });
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
        suggestedWordCount: st.suggestedWordCount || '',
        imageUrl: st.imageUrl || ''
      })));
    }

    setEditingId(question.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette tâche définitivement?')) return;
    setLoading(true);
    try {
      await dbOperations.deleteQuestion(id);
      await loadQuestions();
      alert('Tâche supprimée avec succès!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image doit être inférieure à 5 Mo');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, imageUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubtaskImageUpload = (subtaskIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image doit être inférieure à 5 Mo');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedSubtasks = subtasks.map((subtask, index) => 
          index === subtaskIndex 
            ? { ...subtask, imageUrl: e.target?.result as string }
            : subtask
        );
        setSubtasks(updatedSubtasks);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSubtaskImage = (subtaskIndex: number) => {
    const updatedSubtasks = subtasks.map((subtask, index) => 
      index === subtaskIndex ? { ...subtask, imageUrl: '' } : subtask
    );
    setSubtasks(updatedSubtasks);
    if (subtaskFileRefs.current[subtaskIndex]) {
      subtaskFileRefs.current[subtaskIndex]!.value = '';
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
          <p className="text-gray-600">Données stockées dans le cloud</p>
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              onClick={loadQuestions} 
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Actualiser
            </Button>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating || loading}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Synchronisation avec Firebase en cours...
          </AlertDescription>
        </Alert>
      )}

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier' : 'Créer'} une tâche</CardTitle>
            <CardDescription>
              Les données seront sauvegardées dans Firebase
            </CardDescription>
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <Label>Titre</Label>
              <Input
                placeholder="Expression écrite - Environnement"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label>Contexte général</Label>
              <Textarea
                placeholder="Décrivez le sujet ou le document de référence..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label>Image générale (optionnel)</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img src={formData.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded border" />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="mt-2"
                    disabled={loading}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
            {formData.type === 'writing' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Configuration des 3 sous-tâches</h3>
                <div className="space-y-6">
                  {subtasks.map((subtask, index) => (
                    <Card key={subtask.id} className="p-4 bg-gray-50">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>Titre</Label>
                            <Input
                              value={subtask.title}
                              onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                              placeholder={`Tâche ${subtask.id}`}
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <Label>Mots suggérés</Label>
                            <Input
                              value={subtask.suggestedWordCount}
                              onChange={(e) => updateSubtask(index, 'suggestedWordCount', e.target.value)}
                              placeholder="60-80 mots"
                              disabled={loading}
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
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label>Image pour {subtask.title} (optionnel)</Label>
                          <Input
                            ref={(el) => subtaskFileRefs.current[index] = el}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSubtaskImageUpload(index, e)}
                            disabled={loading}
                          />
                          {subtask.imageUrl && (
                            <div className="mt-2 flex items-start gap-3">
                              <img 
                                src={subtask.imageUrl} 
                                alt={`Image pour ${subtask.title}`} 
                                className="w-24 h-24 object-cover rounded border"
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => removeSubtaskImage(index)}
                                disabled={loading}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Modifier' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertDescription>
          Total: {questions.length} tâches ({writingQuestions.length} écrites, {audioQuestions.length} orales)
          {questions.length > 0 && " - Synchronisé avec Firebase"}
        </AlertDescription>
      </Alert>

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
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary">⏱️ {question.timeLimit} min</Badge>
                        <Badge variant="outline">Firebase</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(question)} disabled={loading}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(question.id)} disabled={loading}>
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
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">⏱️ {question.timeLimit} min</Badge>
                        {question.imageUrl && <Badge variant="outline"><Image className="h-3 w-3 mr-1" />Avec image</Badge>}
                        <Badge variant="outline">Firebase</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(question)} disabled={loading}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(question.id)} disabled={loading}>
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
  );
}