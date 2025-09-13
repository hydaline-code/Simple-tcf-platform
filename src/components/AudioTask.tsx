/* eslint-disable @typescript-eslint/no-explicit-any */

// import { useState, useEffect, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Progress } from './ui/progress';
// import { ArrowLeft, Clock, Mic, Play, Pause, Send, Square } from 'lucide-react';
// import { Alert, AlertDescription } from './ui/alert';


// interface Question {
//   id: string;
//   type: 'writing' | 'audio';
//   title: string;
//   content: string;
//   imageUrl?: string;
//   timeLimit: number;
//   wordLimit?: number;
// }


// interface AudioTaskProps {
//   question: Question;
//   studentName: string;
//   onBack: () => void;
// }


// export function AudioTask({ question, studentName, onBack }: AudioTaskProps) {
//   const [timeLeft, setTimeLeft] = useState(question.timeLimit * 60);
//   const [isTimerActive, setIsTimerActive] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [audioUrl, setAudioUrl] = useState<string>('');
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
//   const [permissionError, setPermissionError] = useState<string>('');
  
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const audioRef = useRef<HTMLAudioElement>(null);


//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isTimerActive && timeLeft > 0 && !isCompleted) {
//       interval = setInterval(() => {
//         setTimeLeft((time) => {
//           if (time <= 1) {
//             setIsTimerActive(false);
//             setIsCompleted(true);
//             if (isRecording) {
//               stopRecording();
//             }
//             // Le téléchargement automatique se fera après l'arrêt de l'enregistrement et la définition de audioBlob
//             return 0;
//           }
//           return time - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isTimerActive, timeLeft, isCompleted, isRecording]);


//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isRecording && !isPaused) {
//       interval = setInterval(() => {
//         setRecordingTime((time) => time + 1);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isRecording, isPaused]);


//   // Vérifier le statut de permission du microphone
//   useEffect(() => {
//     checkMicrophonePermission();
//   }, []);


//   const checkMicrophonePermission = async () => {
//     try {
//       if (navigator.permissions) {
//         const permission = await navigator.permissions.query({ name: 'microphone' as any });
//         setPermissionStatus(permission.state);
        
//         permission.onchange = () => {
//           setPermissionStatus(permission.state);
//         };
//       }
//     } catch (error) {
//       console.log('API de permission non supportée');
//     }
//   };


//   const requestMicrophonePermission = async () => {
//     setPermissionError('');
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       // Arrêter immédiatement le stream car on voulait juste vérifier la permission
//       stream.getTracks().forEach(track => track.stop());
//       setPermissionStatus('granted');
//       return true;
//     } catch (error: any) {
//       console.error('Échec de la demande de permission :', error);
//       setPermissionStatus('denied');
      
//       if (error.name === 'NotAllowedError') {
//         setPermissionError("L'accès au microphone a été refusé. Veuillez activer les permissions du microphone dans les paramètres de votre navigateur et rafraîchir la page.");
//       } else if (error.name === 'NotFoundError') {
//         setPermissionError("Aucun microphone détecté. Veuillez connecter un microphone et réessayer.");
//       } else if (error.name === 'NotSupportedError') {
//         setPermissionError("Votre navigateur ne supporte pas l'enregistrement audio. Veuillez utiliser un navigateur moderne comme Chrome, Firefox ou Safari.");
//       } else {
//         setPermissionError(`Échec d'accès au microphone : ${error.message}`);
//       }
//       return false;
//     }
//   };


//   const startRecording = async () => {
//     setPermissionError('');
    
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       setPermissionStatus('granted');
      
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       audioChunksRef.current = [];


//       mediaRecorderRef.current.ondataavailable = (event) => {
//         audioChunksRef.current.push(event.data);
//       };


//       mediaRecorderRef.current.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
//         setAudioBlob(audioBlob);
//         setAudioUrl(URL.createObjectURL(audioBlob));
//         stream.getTracks().forEach(track => track.stop());
        
//         // Téléchargement automatique si le temps est écoulé
//         if (isCompleted) {
//           setTimeout(() => {
//             const url = URL.createObjectURL(audioBlob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `${studentName}_${question.title}_${new Date().toISOString().split('T')[0]}.wav`;
//             document.body.appendChild(a);
//             a.click();
//             document.body.removeChild(a);
//             URL.revokeObjectURL(url);
//           }, 500); // Petit délai pour s'assurer que l'état est mis à jour
//         }
//       };


//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//       setIsPaused(false);
      
//       // Démarrer le chronomètre au premier enregistrement
//       if (!isTimerActive && !isCompleted) {
//         setIsTimerActive(true);
//       }
//     } catch (error: any) {
//       console.error('Erreur lors du démarrage de l\'enregistrement :', error);
//       setPermissionStatus('denied');
      
//       if (error.name === 'NotAllowedError') {
//         setPermissionError("L'accès au microphone a été refusé. Veuillez cliquer sur \"Autoriser\" lors de l'invite ou activer les permissions dans les paramètres de votre navigateur.");
//       } else if (error.name === 'NotFoundError') {
//         setPermissionError("Aucun microphone détecté. Veuillez connecter un microphone et réessayer.");
//       } else if (error.name === 'NotSupportedError') {
//         setPermissionError("Votre navigateur ne supporte pas l'enregistrement audio. Veuillez utiliser un navigateur moderne comme Chrome, Firefox ou Safari.");
//       } else {
//         setPermissionError(`Échec d'accès au microphone : ${error.message}`);
//       }
//     }
//   };


//   const pauseRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.pause();
//       setIsPaused(true);
//     }
//   };


//   const resumeRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.resume();
//       setIsPaused(false);
//     }
//   };


//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       setIsPaused(false);
//     }
//   };


//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };


//   const getProgressPercentage = () => {
//     const totalTime = question.timeLimit * 60;
//     return ((totalTime - timeLeft) / totalTime) * 100;
//   };


//   const handleSubmit = () => {
//     setIsCompleted(true);
//     setIsTimerActive(false);
    
//     // Télécharger l'enregistrement
//     if (audioBlob) {
//       downloadRecording();
//     }
    
//     // Créer un message WhatsApp pour l'administrateur
//     const message = `Soumission de tâche audio TCF Canada

// Étudiant : ${studentName}
// Tâche : ${question.title}
// Durée de l'enregistrement : ${formatTime(recordingTime)}
// Temps utilisé : ${formatTime(question.timeLimit * 60 - timeLeft)}

// Note : Le fichier audio sera partagé séparément.`;


//     const encodedMessage = encodeURIComponent(message);
//     const whatsappUrl = `https://wa.me/+237620361340?text=${encodedMessage}`;
//     window.open(whatsappUrl, '_blank');
//   };


//   const downloadRecording = () => {
//     if (audioBlob) {
//       const url = URL.createObjectURL(audioBlob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${studentName}_${question.title}_${new Date().toISOString().split('T')[0]}.wav`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     }
//   };


//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       {/* En-tête */}
//       <div className="flex items-center gap-4">
//         <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
//           <ArrowLeft className="h-4 w-4" />
//           Retour aux tâches
//         </Button>
//         <div>
//           <h2 className="text-xl font-semibold">{question.title}</h2>
//           <p className="text-gray-600">Étudiant : {studentName}</p>
//         </div>
//       </div>


//       {/* Instructions de la tâche */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Mic className="h-5 w-5" />
//             Instructions de la tâche
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {question.imageUrl && (
//             <div className="border rounded-lg overflow-hidden">
//               <img 
//                 src={question.imageUrl} 
//                 alt="Image de la tâche" 
//                 className="w-full max-h-96 object-contain"
//               />
//             </div>
//           )}
//           <p className="whitespace-pre-wrap">{question.content}</p>
//         </CardContent>
//       </Card>


//       {/* Chronomètre et statistiques */}
//       <div className="grid md:grid-cols-3 gap-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center gap-3">
//               <Clock className="h-5 w-5 text-blue-600" />
//               <div>
//                 <p className="text-sm text-gray-600">Temps restant</p>
//                 <p className={`text-lg font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
//                   {formatTime(timeLeft)}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>


//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center gap-3">
//               <Mic className="h-5 w-5 text-red-600" />
//               <div>
//                 <p className="text-sm text-gray-600">Temps d'enregistrement</p>
//                 <p className="text-lg font-mono text-gray-900">
//                   {formatTime(recordingTime)}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>


//         <Card>
//           <CardContent className="pt-6">
//             <div>
//               <p className="text-sm text-gray-600 mb-2">Progression</p>
//               <Progress value={getProgressPercentage()} className="h-2" />
//               <p className="text-xs text-gray-500 mt-1">
//                 {Math.round(getProgressPercentage())}% terminé
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>


//       {/* Contrôles d'enregistrement */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Enregistrement</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* Erreur de permission */}
//           {permissionError && (
//             <Alert className="border-red-200 bg-red-50 mb-4">
//               <AlertDescription className="text-red-800">
//                 🎤 {permissionError}
//               </AlertDescription>
//             </Alert>
//           )}


//           {/* Statut de permission */}
//           {permissionStatus === 'denied' && !permissionError && (
//             <Alert className="border-orange-200 bg-orange-50 mb-4">
//               <AlertDescription className="text-orange-800">
//                 🔒 L'accès au microphone est bloqué. Veuillez activer les permissions du microphone pour ce site dans les paramètres de votre navigateur.
//                 <br />
//                 <strong>Chrome/Edge :</strong> Cliquez sur l'icône caméra/microphone dans la barre d'adresse
//                 <br />
//                 <strong>Firefox :</strong> Cliquez sur l'icône du bouclier et activez le microphone
//                 <br />
//                 <strong>Safari :</strong> Allez dans Safari &gt; Réglages &gt; Sites web &gt; Microphone
//               </AlertDescription>
//             </Alert>
//           )}


//           {/* Contrôles d'enregistrement */}
//           <div className="flex justify-center gap-4">
//             {!isRecording ? (
//               <div className="flex flex-col items-center gap-3">
//                 {permissionStatus === 'denied' ? (
//                   <Button 
//                     onClick={requestMicrophonePermission}
//                     variant="outline"
//                     className="flex items-center gap-2 px-8"
//                     size="lg"
//                   >
//                     <Mic className="h-5 w-5" />
//                     Activer le microphone
//                   </Button>
//                 ) : (
//                   <Button 
//                     onClick={startRecording}
//                     className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8"
//                     size="lg"
//                     disabled={isCompleted && timeLeft === 0}
//                   >
//                     <Mic className="h-5 w-5" />
//                     Commencer l'enregistrement
//                   </Button>
//                 )}
//               </div>
//             ) : (
//               <div className="flex gap-3">
//                 {!isPaused ? (
//                   <Button 
//                     onClick={pauseRecording}
//                     variant="outline"
//                     className="flex items-center gap-2"
//                   >
//                     <Pause className="h-4 w-4" />
//                     Pause
//                   </Button>
//                 ) : (
//                   <Button 
//                     onClick={resumeRecording}
//                     className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
//                   >
//                     <Play className="h-4 w-4" />
//                     Reprendre
//                   </Button>
//                 )}
//                 <Button 
//                   onClick={stopRecording}
//                   variant="destructive"
//                   className="flex items-center gap-2"
//                 >
//                   <Square className="h-4 w-4" />
//                   Arrêter
//                 </Button>
//               </div>
//             )}
//           </div>


//           {/* Statut de l'enregistrement */}
//           {isRecording && (
//             <div className="text-center">
//               <div className="flex items-center justify-center gap-2 text-red-600">
//                 <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
//                 <span className="font-medium">
//                   {isPaused ? "Enregistrement en pause" : "Enregistrement..."}
//                 </span>
//               </div>
//             </div>
//           )}


//           {/* Lecture audio */}
//           {audioUrl && (
//             <div className="space-y-4">
//               <div className="border rounded-lg p-4 bg-gray-50">
//                 <p className="text-sm text-gray-600 mb-2">Aperçu de l'enregistrement :</p>
//                 <audio 
//                   ref={audioRef}
//                   controls 
//                   src={audioUrl} 
//                   className="w-full"
//                 />
//               </div>
//               <div className="flex justify-center">
//                 <Button 
//                   onClick={downloadRecording}
//                   variant="outline"
//                   className="flex items-center gap-2"
//                 >
//                   Télécharger l'enregistrement
//                 </Button>
//               </div>
//             </div>
//           )}


//           {/* Alertes */}
//           {!isTimerActive && !isCompleted && !isRecording && permissionStatus !== 'denied' && (
//             <Alert>
//               <AlertDescription>
//                 💡 Le chronomètre démarre automatiquement lorsque vous commencez l'enregistrement.
//                 {permissionStatus === 'prompt' && (
//                   <>
//                     <br />
//                     <span className="font-medium">Note : Vous serez invité à autoriser l'accès au microphone lors du démarrage de l'enregistrement.</span>
//                   </>
//                 )}
//               </AlertDescription>
//             </Alert>
//           )}


//           {isCompleted && (
//             <Alert>
//               <AlertDescription>
//                 ✅ Tâche terminée ! Vous pouvez maintenant soumettre votre réponse sur WhatsApp.
//               </AlertDescription>
//             </Alert>
//           )}


//           {timeLeft === 0 && (
//             <Alert className="border-red-200 bg-red-50">
//               <AlertDescription className="text-red-800">
//                 ⏰ Le temps est écoulé ! Veuillez soumettre votre réponse.
//               </AlertDescription>
//             </Alert>
//           )}
//         </CardContent>
//       </Card>


//       {/* Aide au dépannage */}
//       {(permissionStatus === 'denied' || permissionError) && (
//         <Card className="border-blue-200 bg-blue-50">
//           <CardHeader>
//             <CardTitle className="text-blue-800 text-lg">Dépannage du microphone</CardTitle>
//           </CardHeader>
//           <CardContent className="text-blue-700 space-y-3">
//             <div>
//               <h4 className="font-medium mb-2">Si l'accès au microphone est bloqué :</h4>
//               <ul className="list-disc list-inside space-y-1 text-sm">
//                 <li><strong>Chrome/Edge :</strong> Cliquez sur l'icône caméra/microphone dans la barre d'adresse et sélectionnez "Autoriser"</li>
//                 <li><strong>Firefox :</strong> Cliquez sur l'icône du bouclier ou du cadenas dans la barre d'adresse et activez le microphone</li>
//                 <li><strong>Safari :</strong> Allez dans Safari → Réglages → Sites web → Microphone et mettez sur "Autoriser"</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-medium mb-2">Autres solutions :</h4>
//               <ul className="list-disc list-inside space-y-1 text-sm">
//                 <li>Rafraîchir la page après avoir activé les permissions</li>
//                 <li>Vérifier si votre microphone est connecté et fonctionnel</li>
//                 <li>Essayer un autre navigateur (Chrome, Firefox ou Safari recommandés)</li>
//                 <li>Vérifier que le site est servi via HTTPS (connexion sécurisée)</li>
//               </ul>
//             </div>
//           </CardContent>
//         </Card>
//       )}


//       {/* Bouton de soumission */}
//       <div className="flex justify-center">
//         <Button 
//           onClick={handleSubmit}
//           disabled={!audioBlob && !isCompleted}
//           className="flex items-center gap-2 px-8"
//           size="lg"
//         >
//           <Send className="h-4 w-4" />
//           Envoyer par WhatsApp
//         </Button>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, Clock, Mic, Play, Pause, Send, Square } from 'lucide-react';
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

interface AudioTaskProps {
  question: Question;
  studentName: string;
  onBack: () => void;
}

export function AudioTask({ question, studentName, onBack }: AudioTaskProps) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [permissionError, setPermissionError] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  const downloadRecording = useCallback(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${studentName}_${question.title}_${new Date().toISOString().split('T')[0]}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [audioBlob, studentName, question.title]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsTimerActive(false);
            setIsCompleted(true);
            if (isRecording) {
              stopRecording();
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, isCompleted, isRecording, stopRecording]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((time) => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as any });
        setPermissionStatus(permission.state);

        permission.onchange = () => {
          setPermissionStatus(permission.state);
        };
      }
    } catch (error) {
      console.log('API de permission non supportée');
    }
  };

  const requestMicrophonePermission = async () => {
    setPermissionError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      return true;
     
    } catch (error: any) {
      console.error('Échec de la demande de permission :', error);
      setPermissionStatus('denied');

      if (error.name === 'NotAllowedError') {
        setPermissionError("L'accès au microphone a été refusé. Veuillez activer les permissions du microphone dans les paramètres de votre navigateur et rafraîchir la page.");
      } else if (error.name === 'NotFoundError') {
        setPermissionError("Aucun microphone détecté. Veuillez connecter un microphone et réessayer.");
      } else if (error.name === 'NotSupportedError') {
        setPermissionError("Votre navigateur ne supporte pas l'enregistrement audio. Veuillez utiliser un navigateur moderne comme Chrome, Firefox ou Safari.");
      } else {
        setPermissionError(`Échec d'accès au microphone : ${error.message}`);
      }
      return false;
    }
  };

  const startRecording = async () => {
    setPermissionError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());

        if (isCompleted) {
          setTimeout(() => {
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${studentName}_${question.title}_${new Date().toISOString().split('T')[0]}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 500);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);

      if (!isTimerActive && !isCompleted) {
        setIsTimerActive(true);
      }
    } catch (error: any) {
      console.error('Erreur lors du démarrage de l\'enregistrement :', error);
      setPermissionStatus('denied');

      if (error.name === 'NotAllowedError') {
        setPermissionError("L'accès au microphone a été refusé. Veuillez cliquer sur \"Autoriser\" lors de l'invite ou activer les permissions dans les paramètres de votre navigateur.");
      } else if (error.name === 'NotFoundError') {
        setPermissionError("Aucun microphone détecté. Veuillez connecter un microphone et réessayer.");
      } else if (error.name === 'NotSupportedError') {
        setPermissionError("Votre navigateur ne supporte pas l'enregistrement audio. Veuillez utiliser un navigateur moderne comme Chrome, Firefox ou Safari.");
      } else {
        setPermissionError(`Échec d'accès au microphone : ${error.message}`);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
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

  const handleSubmit = () => {
    setIsCompleted(true);
    setIsTimerActive(false);

    if (audioBlob) {
      downloadRecording();
    }

    const message = `Soumission de tâche audio TCF Canada


Étudiant : ${studentName}
Tâche : ${question.title}
Durée de l'enregistrement : ${formatTime(recordingTime)}
Temps utilisé : ${formatTime(question.timeLimit * 60 - timeLeft)}


Note : Veuillez noter que le fichier audio a été téléchargé et bien vouloir le joindre manuellement.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/+237656450825?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
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
        </CardContent>
      </Card>

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
              <Mic className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Temps d'enregistrement</p>
                <p className="text-lg font-mono text-gray-900">
                  {formatTime(recordingTime)}
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
              <p className="text-xs text-gray-500 mt-1">{Math.round(getProgressPercentage())}% terminé</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enregistrement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {permissionError && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertDescription className="text-red-800">🎤 {permissionError}</AlertDescription>
            </Alert>
          )}

          {permissionStatus === 'denied' && !permissionError && (
            <Alert className="border-orange-200 bg-orange-50 mb-4">
              <AlertDescription className="text-orange-800">
                🔒 L'accès au microphone est bloqué. Veuillez activer les permissions du microphone pour ce site dans les paramètres de votre navigateur.
                <br />
                <strong>Chrome/Edge :</strong> Cliquez sur l'icône caméra/microphone dans la barre d'adresse
                <br />
                <strong>Firefox :</strong> Cliquez sur l'icône du bouclier et activez le microphone
                <br />
                <strong>Safari :</strong> Allez dans Safari &gt; Réglages &gt; Sites web &gt; Microphone
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <div className="flex flex-col items-center gap-3">
                {permissionStatus === 'denied' ? (
                  <Button
                    onClick={requestMicrophonePermission}
                    variant="outline"
                    className="flex items-center gap-2 px-8"
                    size="lg"
                  >
                    <Mic className="h-5 w-5" />
                    Activer le microphone
                  </Button>
                ) : (
                  <Button
                    onClick={startRecording}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8"
                    size="lg"
                    disabled={isCompleted && timeLeft === 0}
                  >
                    <Mic className="h-5 w-5" />
                    Commencer l'enregistrement
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                {!isPaused ? (
                  <Button onClick={pauseRecording} variant="outline" className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeRecording} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4" />
                    Reprendre
                  </Button>
                )}
                <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Arrêter
                </Button>
              </div>
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-medium">{isPaused ? 'Enregistrement en pause' : 'Enregistrement...'}</span>
              </div>
            </div>
          )}

          {audioUrl && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Aperçu de l'enregistrement :</p>
                <audio ref={audioRef} controls src={audioUrl} className="w-full" />
              </div>
              <div className="flex justify-center">
                <Button onClick={downloadRecording} variant="outline" className="flex items-center gap-2">
                  Télécharger l'enregistrement
                </Button>
              </div>
            </div>
          )}

          {!isTimerActive && !isCompleted && !isRecording && permissionStatus !== 'denied' && (
            <Alert>
              <AlertDescription>
                💡 Le chronomètre démarre automatiquement lorsque vous commencez l'enregistrement.
                {permissionStatus === 'prompt' && (
                  <>
                    <br />
                    <span className="font-medium">
                      Note : Vous serez invité à autoriser l'accès au microphone lors du démarrage de l'enregistrement.
                    </span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isCompleted && (
            <Alert>
              <AlertDescription>✅ Tâche terminée ! Vous pouvez maintenant soumettre votre réponse sur WhatsApp.</AlertDescription>
            </Alert>
          )}

          {timeLeft === 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">⏰ Le temps est écoulé ! Veuillez soumettre votre réponse.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {(permissionStatus === 'denied' || permissionError) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">Dépannage du microphone</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-3">
            <div>
              <h4 className="font-medium mb-2">Si l'accès au microphone est bloqué :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Chrome/Edge :</strong> Cliquez sur l'icône caméra/microphone dans la barre d'adresse et sélectionnez
                  "Autoriser"
                </li>
                <li>
                  <strong>Firefox :</strong> Cliquez sur l'icône du bouclier ou du cadenas dans la barre d'adresse et activez le
                  microphone
                </li>
                <li>
                  <strong>Safari :</strong> Allez dans Safari → Réglages → Sites web → Microphone et mettez sur "Autoriser"
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Autres solutions :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Rafraîchir la page après avoir activé les permissions</li>
                <li>Vérifier si votre microphone est connecté et fonctionnel</li>
                <li>Essayer un autre navigateur (Chrome, Firefox ou Safari recommandés)</li>
                <li>Vérifier que le site est servi via HTTPS (connexion sécurisée)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!audioBlob && !isCompleted}
          className="flex items-center gap-2 px-8"
          size="lg"
        >
          <Send className="h-4 w-4" />
          Envoyer par WhatsApp
        </Button>
      </div>
    </div>
  );
}

