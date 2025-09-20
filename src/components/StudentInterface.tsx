
import { useState, useEffect } from 'react';
import { WritingTask } from './WritingTask';
import { AudioTask } from './AudioTask';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { User, PenTool, Mic, Loader2 } from 'lucide-react';
import { dbOperations, type Question } from '../lib/firebase';

export function StudentInterface() {
  const [studentName, setStudentName] = useState('');
  const [selectedTask, setSelectedTask] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isNameSet, setIsNameSet] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
    
    // Load student name from localStorage
    const savedName = localStorage.getItem('tcf-student-name');
    if (savedName) {
      setStudentName(savedName);
      setIsNameSet(true);
    }
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const questionsData = await dbOperations.getQuestions();
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = () => {
    if (studentName.trim()) {
      localStorage.setItem('tcf-student-name', studentName);
      setIsNameSet(true);
      window.dispatchEvent(new Event('tcf-student-name-change'));
    }
  };

  const handleSelectTask = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    setSelectedTask(question || null);
  };

  const handleBackToTasks = () => {
    setSelectedTask(null);
    // Reload questions when coming back to refresh data
    loadQuestions();
  };

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Bienvenue sur la préparation TCF Canada Avec Monsieur Yannick</CardTitle>
            <CardDescription>
              Veuillez saisir votre nom pour commencer votre session de préparation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">Nom de l'étudiant</Label>
              <Input
                id="student-name"
                placeholder="Entrez votre nom complet"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartTask()}
              />
            </div>
            <Button 
              onClick={handleStartTask} 
              className="w-full"
              disabled={!studentName.trim()}
            >
              Commencer la préparation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTask) {
    return selectedTask.type === 'writing' ? (
      <WritingTask 
        question={selectedTask} 
        studentName={studentName}
        onBack={handleBackToTasks}
      />
    ) : (
      <AudioTask 
        question={selectedTask} 
        studentName={studentName}
        onBack={handleBackToTasks}
      />
    );
  }

  const writingTasks = questions.filter(q => q.type === 'writing');
  const audioTasks = questions.filter(q => q.type === 'audio');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Bienvenue, {studentName} !</h2>
        <p className="text-gray-600 mt-2">Choisissez une tâche pour commencer votre préparation TCF Canada</p>
        {loading && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Chargement des tâches depuis Firebase...</span>
          </div>
        )}
      </div>

      <div className="flex justify-center mb-4">
        <Button 
          variant="outline"
          onClick={loadQuestions}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Actualiser les tâches
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Writing Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <PenTool className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Tâches écrites</CardTitle>
                <CardDescription>Entraînez-vous à vos compétences d'expression écrite</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : writingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune tâche écrite disponible. Contactez votre administrateur.
              </p>
            ) : (
              writingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectTask(task.id)}
                >
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="text-sm text-gray-600 mt-1 flex gap-4">
                    <span>⏱️ {task.timeLimit} min</span>
                    {task.wordLimit && <span>📝 {task.wordLimit} mots</span>}
                    {task.subtasks && <span>📋 3 sous-tâches</span>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Audio Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mic className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Tâches orales</CardTitle>
                <CardDescription>Entraînez-vous à vos compétences d'expression orale</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : audioTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune tâche orale disponible. Contactez votre administrateur.
              </p>
            ) : (
              audioTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectTask(task.id)}
                >
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>⏱️ {task.timeLimit} min</span>
                    {task.imageUrl && <span className="ml-2">🖼️ Avec image</span>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => {
            setIsNameSet(false);
            setStudentName('');
            localStorage.removeItem('tcf-student-name');
            window.dispatchEvent(new Event('tcf-student-name-change'));
          }}
        >
          Changer le nom de l'étudiant
        </Button>
      </div>
    </div>
  );
}