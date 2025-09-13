import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { ArrowLeft, Clock, FileText, Send, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

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

interface WritingTaskProps {
  question: Question;
  studentName: string;
  onBack: () => void;
}

interface Task {
  id: number;
  title: string;
  instruction: string;
  response: string;
  wordCount: number;
  isCompleted: boolean;
  suggestedWordCount?: string;
}

export function WritingTask({ question, studentName, onBack }: WritingTaskProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize tasks from admin-created subtasks or defaults
  useEffect(() => {
    if (question.subtasks && question.subtasks.length > 0) {
      const initialTasks = question.subtasks.map(subtask => ({
        id: subtask.id,
        title: subtask.title,
        instruction: subtask.instruction,
        response: '',
        wordCount: 0,
        isCompleted: false,
        suggestedWordCount: subtask.suggestedWordCount
      }));
      setTasks(initialTasks);
    } else {
      // Default 3 tasks if admin hasn't configured
      const defaultTasks = [
        { id: 1, title: 'Tâche 1', instruction: 'Présentez votre point de vue (60-80 mots)', response: '', wordCount: 0, isCompleted: false, suggestedWordCount: '60-80 mots' },
        { id: 2, title: 'Tâche 2', instruction: 'Développez avec des exemples (120-150 mots)', response: '', wordCount: 0, isCompleted: false, suggestedWordCount: '120-150 mots' },
        { id: 3, title: 'Tâche 3', instruction: 'Concluez avec des solutions (160-180 mots)', response: '', wordCount: 0, isCompleted: false, suggestedWordCount: '160-180 mots' }
      ];
      setTasks(defaultTasks);
    }
  }, [question]);

  // Single timer for all tasks
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

  // Update total word count
  useEffect(() => {
    const total = tasks.reduce((sum, task) => sum + task.wordCount, 0);
    setTotalWordCount(total);
  }, [tasks]);

  const handleTextChange = (value: string) => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    const updatedTasks = tasks.map((task, index) => {
      if (index === currentTaskIndex) {
        return {
          ...task,
          response: value,
          wordCount: wordCount,
          isCompleted: value.trim().length > 20
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);

    // Start timer on first keystroke
    if (!isTimerActive && !isCompleted && value.length === 1) {
      setIsTimerActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goToTask = (taskIndex: number) => {
    if (taskIndex >= 0 && taskIndex < tasks.length) {
      setCurrentTaskIndex(taskIndex);
    }
  };

  const getCurrentTask = () => tasks[currentTaskIndex];

  const downloadAllResponses = () => {
    const allContent = tasks.map((task) => 
      `${task.title} (${task.wordCount} mots):\n${task.instruction}\n\nRéponse:\n${task.response}\n\n${'='.repeat(50)}\n\n`
    ).join('');

    const summary = `TCF Canada - Expression Écrite
Étudiant: ${studentName}
Temps utilisé: ${formatTime(question.timeLimit * 60 - timeLeft)}
Mots total: ${totalWordCount}

${allContent}`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentName}_TCF_Expression_Ecrite.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAutoSubmit = () => {
    downloadAllResponses();
  };

  const handleSubmit = () => {
    setIsCompleted(true);
    setIsTimerActive(false);
    downloadAllResponses();
    
    const message = `TCF Canada - Expression Écrite
Étudiant: ${studentName}
Tâches: ${tasks.filter(t => t.isCompleted).length}/3
Temps: ${formatTime(question.timeLimit * 60 - timeLeft)}
Mots: ${totalWordCount}`;

    const whatsappUrl = `https://wa.me/+237656450825?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (tasks.length === 0) return <div>Chargement...</div>;

  const completedTasksCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{question.title}</h2>
          <p className="text-gray-600">Étudiant: {studentName}</p>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Consignes générales</CardTitle>
        </CardHeader>
        <CardContent>
          {question.imageUrl && (
            <img src={question.imageUrl} alt="Document" className="w-full max-h-96 object-contain mb-4" />
          )}
          <p>{question.content}</p>
          <Alert className="mt-4">
            <AlertDescription>
              Vous avez 3 tâches à compléter avec un seul chronomètre.
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
                <p className="text-lg font-mono">{totalWordCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Progression</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono">{completedTasksCount}/3</span>
                <Progress value={(completedTasksCount / 3) * 100} className="h-2 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation des tâches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {tasks.map((task, index) => (
              <Button
                key={task.id}
                variant={currentTaskIndex === index ? "default" : "outline"}
                onClick={() => goToTask(index)}
                className="flex items-center gap-2"
              >
                {task.isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {task.title}
                <Badge variant="secondary">{task.wordCount}</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{getCurrentTask().title}</span>
            {getCurrentTask().suggestedWordCount && (
              <span className="text-sm text-gray-500">
                Suggéré: {getCurrentTask().suggestedWordCount}
              </span>
            )}
          </CardTitle>
          <CardDescription>{getCurrentTask().instruction}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            placeholder={`Rédigez votre réponse...`}
            value={getCurrentTask().response}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[300px] resize-none"
            disabled={isCompleted}
          />
          
          {!isTimerActive && !isCompleted && getCurrentTask().response.length === 0 && (
            <Alert className="mt-4">
              <AlertDescription>
                Le chronomètre démarrera quand vous commencerez à écrire.
              </AlertDescription>
            </Alert>
          )}

          {timeLeft === 0 && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Temps écoulé! Soumettez votre travail.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => goToTask(currentTaskIndex - 1)}
            disabled={currentTaskIndex === 0}
          >
            Précédent
          </Button>
          <Button 
            variant="outline"
            onClick={() => goToTask(currentTaskIndex + 1)}
            disabled={currentTaskIndex === tasks.length - 1}
          >
            Suivant
          </Button>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!tasks.some(t => t.response.trim().length > 0)}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Soumettre
        </Button>
      </div>
    </div>
  );
}