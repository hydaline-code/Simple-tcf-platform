import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { ArrowLeft, Clock, FileText, Send, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface Question {
  id: string;
  type: 'writing' | 'audio';
  title: string;
  content: string;
  imageUrl?: string;
  timeLimit: number;
  wordLimit?: number;
}

interface WritingTasksProps {
  question: Question;
  studentName: string;
  onBack: () => void;
}

interface SubtaskData {
  id: number;
  title: string;
  content: string;
  wordCount: number;
}

export function WritingTasks({ question, studentName, onBack }: WritingTasksProps) {
  const [currentSubtask, setCurrentSubtask] = useState(0);
  const [subtasks, setSubtasks] = useState<SubtaskData[]>([
    { id: 1, title: 'Sous-tâche 1', content: '', wordCount: 0 },
    { id: 2, title: 'Sous-tâche 2', content: '', wordCount: 0 },
    { id: 3, title: 'Sous-tâche 3', content: '', wordCount: 0 }
  ]);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsTimerActive(false);
            setIsCompleted(true);
            handleAutoSubmit();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, isCompleted]);

  // Update total word count when subtasks change
  useEffect(() => {
    const total = subtasks.reduce((sum, subtask) => sum + subtask.wordCount, 0);
    setTotalWordCount(total);
  }, [subtasks]);

  const handleTextChange = (value: string) => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Update current subtask
    const updatedSubtasks = subtasks.map((subtask, index) => 
      index === currentSubtask 
        ? { ...subtask, content: value, wordCount }
        : subtask
    );
    setSubtasks(updatedSubtasks);

    // Start timer on first keystroke
    if (!isTimerActive && !isCompleted && value.length === 1 && currentSubtask === 0) {
      setIsTimerActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = question.timeLimit * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getWordCountStatus = () => {
    if (!question.wordLimit) return 'text-gray-600';
    if (totalWordCount < question.wordLimit * 0.8) return 'text-orange-600';
    if (totalWordCount > question.wordLimit * 1.2) return 'text-red-600';
    return 'text-green-600';
  };

  const saveToFirestore = async () => {
    const sessionData = {
      studentName,
      questionId: question.id,
      questionTitle: question.title,
      subtasks: subtasks.map(subtask => ({
        id: subtask.id,
        title: subtask.title,
        content: subtask.content,
        wordCount: subtask.wordCount
      })),
      totalWordCount,
      timeUsed: question.timeLimit * 60 - timeLeft,
      timeLimit: question.timeLimit * 60,
      completedAt: new Date().toISOString(),
      isCompleted: true
    };

    try {
      // In a real implementation, you'd use Firebase SDK
      console.log('Saving to Firestore:', sessionData);
      
      // For now, also save to localStorage as backup
      const existingSessions = JSON.parse(localStorage.getItem('tcf-sessions') || '[]');
      existingSessions.push(sessionData);
      localStorage.setItem('tcf-sessions', JSON.stringify(existingSessions));
      
      return sessionData;
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      throw error;
    }
  };

  const downloadAllResponses = () => {
    const allContent = subtasks.map((subtask, index) => 
      `${subtask.title}:\n${subtask.content}\n\n`
    ).join('');

    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentName}_${question.title}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAutoSubmit = async () => {
    try {
      await saveToFirestore();
      downloadAllResponses();
    } catch (error) {
      console.error('Auto-submit failed:', error);
    }
  };

  const handleSubmit = async () => {
    setIsCompleted(true);
    setIsTimerActive(false);
    
    try {
      await saveToFirestore();
      downloadAllResponses();
      
      // Create WhatsApp message
      const message = `Soumission de tâche écrite TCF Canada

Étudiant : ${studentName}
Tâche : ${question.title}
Sous-tâches complétées : ${subtasks.filter(s => s.content.trim().length > 0).length}/3
Nombre total de mots : ${totalWordCount}${question.wordLimit ? ` / ${question.wordLimit}` : ''}
Temps utilisé : ${formatTime(question.timeLimit * 60 - timeLeft)}

Détails par sous-tâche :
${subtasks.map(subtask => `${subtask.title}: ${subtask.wordCount} mots`).join('\n')}

Note : Le fichier avec toutes les réponses a été téléchargé et sauvegardé dans le système.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/+237656450825?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const canSubmit = subtasks.some(s => s.content.trim().length > 0) && (isCompleted || timeLeft === 0);

  const goToSubtask = (index: number) => {
    if (index >= 0 && index < subtasks.length) {
      setCurrentSubtask(index);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux tâches
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{question.title}</h2>
          <p className="text-gray-600">Étudiant : {studentName}</p>
        </div>
      </div>

      {/* Task Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Instructions de la tâche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.imageUrl && (
            <div className="border rounded-lg overflow-hidden">
              <img 
                src={question.imageUrl} 
                alt="Image de la tâche" 
                className="w-full max-h-96 object-contain"
              />
            </div>
          )}
          <p className="whitespace-pre-wrap">{question.content}</p>
          <Alert>
            <AlertDescription>
              Cette tâche est divisée en 3 sous-tâches. Vous avez un seul chronomètre pour toutes les sous-tâches.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Timer and Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Temps restant</p>
                <p className={`text-lg font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Mots totaux</p>
                <p className={`text-lg font-mono ${getWordCountStatus()}`}>
                  {totalWordCount}{question.wordLimit ? ` / ${question.wordLimit}` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Progression</p>
              <Progress value={getProgressPercentage()} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(getProgressPercentage())}% terminé
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subtask Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Sous-tâches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {subtasks.map((subtask, index) => (
              <Button
                key={subtask.id}
                variant={currentSubtask === index ? "default" : "outline"}
                onClick={() => goToSubtask(index)}
                className="flex items-center gap-2"
              >
                {subtask.content.trim().length > 0 && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
                {subtask.title} ({subtask.wordCount} mots)
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Writing Area */}
      <Card>
        <CardHeader>
          <CardTitle>{subtasks[currentSubtask].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            placeholder={`Rédigez votre réponse pour la ${subtasks[currentSubtask].title.toLowerCase()}...`}
            value={subtasks[currentSubtask].content}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[300px] resize-none"
            disabled={isCompleted && timeLeft === 0}
          />
          
          {!isTimerActive && !isCompleted && currentSubtask === 0 && subtasks[0].content.length === 0 && (
            <Alert className="mt-4">
              <AlertDescription>
                Le chronomètre démarrera automatiquement lorsque vous commencerez à taper dans la première sous-tâche.
              </AlertDescription>
            </Alert>
          )}

          {isCompleted && (
            <Alert className="mt-4">
              <AlertDescription>
                Tâche terminée ! Vous pouvez maintenant soumettre votre réponse sur WhatsApp.
              </AlertDescription>
            </Alert>
          )}

          {timeLeft === 0 && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Temps écoulé ! Veuillez soumettre votre réponse.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation and Submit */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => goToSubtask(currentSubtask - 1)}
            disabled={currentSubtask === 0}
          >
            Précédent
          </Button>
          <Button 
            variant="outline"
            onClick={() => goToSubtask(currentSubtask + 1)}
            disabled={currentSubtask === subtasks.length - 1}
          >
            Suivant
          </Button>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-8"
          size="lg"
        >
          <Send className="h-4 w-4" />
          Soumettre sur WhatsApp
        </Button>
      </div>
    </div>
  );
}