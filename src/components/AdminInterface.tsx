// import { useState, useEffect, useRef } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { Button } from './ui/button';
// import { Textarea } from './ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { Badge } from './ui/badge';
// import { Plus, Edit, Trash2, Save, X, PenTool, Mic, Image } from 'lucide-react';
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

// export function AdminInterface() {
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [isCreating, setIsCreating] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [formData, setFormData] = useState<{
//     type: 'writing' | 'audio',
//     title: string,
//     content: string,
//     imageUrl: string,
//     timeLimit: number,
//     wordLimit?: number
//   }>({
//     type: 'writing',
//     title: '',
//     content: '',
//     imageUrl: '',
//     timeLimit: 30,
//     wordLimit: 250
//   });
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     loadQuestions();
//   }, []);

//   const loadQuestions = () => {
//     const savedQuestions = localStorage.getItem('tcf-questions');
//     if (savedQuestions) {
//       setQuestions(JSON.parse(savedQuestions));
//     }
//   };

//   const saveQuestions = (updatedQuestions: Question[]) => {
//     localStorage.setItem('tcf-questions', JSON.stringify(updatedQuestions));
//     setQuestions(updatedQuestions);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.title.trim() || !formData.content.trim()) {
//       alert('Veuillez remplir tous les champs obligatoires');
//       return;
//     }

//     const questionData = {
//       ...formData,
//       id: editingId || Date.now().toString(),
//       ...(formData.type === 'audio' ? { wordLimit: undefined } : {})
//     };

//     let updatedQuestions;
//     if (editingId) {
//       updatedQuestions = questions.map(q => q.id === editingId ? questionData : q);
//     } else {
//       updatedQuestions = [...questions, questionData];
//     }

//     saveQuestions(updatedQuestions);
//     resetForm();
//   };

//   const resetForm = () => {
//     setFormData({
//       type: 'writing',
//       title: '',
//       content: '',
//       imageUrl: '',
//       timeLimit: 30,
//       wordLimit: 250
//     });
//     setIsCreating(false);
//     setEditingId(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleEdit = (question: Question) => {
//     setFormData({
//       type: question.type,
//       title: question.title,
//       content: question.content,
//       imageUrl: question.imageUrl || '',
//       timeLimit: question.timeLimit,
//       wordLimit: question.wordLimit || 250
//     });
//     setEditingId(question.id);
//     setIsCreating(true);
//   };

//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (!file.type.startsWith('image/')) {
//         alert('Veuillez sélectionner un fichier image');
//         return;
//       }
      
//       if (file.size > 5 * 1024 * 1024) {
//         alert("L'image doit être inférieure à 5 Mo");
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const imageUrl = e.target?.result as string;
//         setFormData({ ...formData, imageUrl });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeImage = () => {
//     setFormData({ ...formData, imageUrl: '' });
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleDelete = (id: string) => {
//     if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
//       const updatedQuestions = questions.filter(q => q.id !== id);
//       saveQuestions(updatedQuestions);
//     }
//   };

//   const writingQuestions = questions.filter(q => q.type === 'writing');
//   const audioQuestions = questions.filter(q => q.type === 'audio');

//   return (
//     <div className="max-w-6xl mx-auto space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-900">Panneau d’administration</h2>
//           <p className="text-gray-600 mt-1">Gérer les tâches de préparation au TCF Canada</p>
//         </div>
//         <Button 
//           onClick={() => setIsCreating(true)}
//           className="flex items-center gap-2"
//           disabled={isCreating}
//         >
//           <Plus className="h-4 w-4" />
//           Ajouter une nouvelle tâche
//         </Button>
//       </div>

//       {/* Formulaire de création/édition */}
//       {isCreating && (
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               {editingId ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
//             </CardTitle>
//             <CardDescription>
//               {editingId ? 'Mettre à jour les détails ci-dessous' : 'Remplissez les détails pour créer une nouvelle tâche'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="type">Type de tâche</Label>
//                   <Select
//                     value={formData.type}
//                     onValueChange={(value: 'writing' | 'audio') => 
//                       setFormData({ ...formData, type: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="writing">Tâche écrite</SelectItem>
//                       <SelectItem value="audio">Tâche audio</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="timeLimit">Durée (minutes)</Label>
//                   <Input
//                     id="timeLimit"
//                     type="number"
//                     min="1"
//                     max="120"
//                     value={formData.timeLimit}
//                     onChange={(e) => setFormData({ 
//                       ...formData, 
//                       timeLimit: parseInt(e.target.value) || 30 
//                     })}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="title">Titre de la tâche</Label>
//                 <Input
//                   id="title"
//                   placeholder="Entrez un titre descriptif pour la tâche"
//                   value={formData.title}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 />
//               </div>

//               {formData.type === 'writing' && (
//                 <div className="space-y-2">
//                   <Label htmlFor="wordLimit">Nombre de mots (optionnel)</Label>
//                   <Input
//                     id="wordLimit"
//                     type="number"
//                     min="50"
//                     max="1000"
//                     value={formData.wordLimit ?? ''}
//                     onChange={(e) => setFormData({ 
//                       ...formData, 
//                       wordLimit: e.target.value === '' ? undefined : parseInt(e.target.value)
//                     })}
//                     placeholder="Laisser vide pour aucune limite"
//                   />
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <Label htmlFor="content">Consignes de la tâche</Label>
//                 <Textarea
//                   id="content"
//                   placeholder="Entrez les consignes détaillées de la tâche..."
//                   className="min-h-[120px]"
//                   value={formData.content}
//                   onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="image">Image de la tâche (optionnel)</Label>
//                 <div className="space-y-3">
//                   <Input
//                     ref={fileInputRef}
//                     id="image"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     className="cursor-pointer"
//                   />
//                   <p className="text-sm text-gray-500">
//                     Téléchargez une image pour accompagner la consigne (max 5 Mo)
//                   </p>
                  
//                   {formData.imageUrl && (
//                     <div className="space-y-2">
//                       <div className="border rounded-lg overflow-hidden bg-gray-50">
//                         <img 
//                           src={formData.imageUrl} 
//                           alt="Aperçu de la tâche" 
//                           className="w-full max-h-48 object-contain"
//                         />
//                       </div>
//                       <Button 
//                         type="button" 
//                         variant="outline" 
//                         size="sm"
//                         onClick={removeImage}
//                         className="flex items-center gap-2"
//                       >
//                         <X className="h-3 w-3" />
//                         Supprimer l’image
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex gap-3">
//                 <Button type="submit" className="flex items-center gap-2">
//                   <Save className="h-4 w-4" />
//                   {editingId ? 'Mettre à jour' : 'Créer la tâche'}
//                 </Button>
//                 <Button type="button" variant="outline" onClick={resetForm}>
//                   <X className="h-4 w-4" />
//                   Annuler
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}

//       {/* Aperçu des questions */}
//       <div className="grid gap-6">
//         <Alert>
//           <AlertDescription>
//             📊 Total de tâches : {questions.length} ({writingQuestions.length} écrites, {audioQuestions.length} orales)
//           </AlertDescription>
//         </Alert>

//         {/* Tâches écrites */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <PenTool className="h-5 w-5 text-green-600" />
//               Tâches écrites ({writingQuestions.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {writingQuestions.length === 0 ? (
//               <p className="text-gray-500 text-center py-8">Aucune tâche écrite créée pour l’instant</p>
//             ) : (
//               <div className="space-y-4">
//                 {writingQuestions.map((question) => (
//                   <div key={question.id} className="border rounded-lg p-4">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <h4 className="font-medium">{question.title}</h4>
//                         {question.imageUrl && (
//                           <div className="mt-2 mb-2">
//                             <Badge variant="outline" className="flex items-center gap-1 w-fit">
//                               <Image className="h-3 w-3" />
//                               Avec image
//                             </Badge>
//                           </div>
//                         )}
//                         <p className="text-gray-600 text-sm mt-1 line-clamp-2">
//                           {question.content}
//                         </p>
//                         <div className="flex gap-2 mt-2">
//                           <Badge variant="secondary">⏱️ {question.timeLimit} min</Badge>
//                           {question.wordLimit && (
//                             <Badge variant="secondary">📝 {question.wordLimit} mots</Badge>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex gap-2 ml-4">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleEdit(question)}
//                         >
//                           <Edit className="h-3 w-3" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => handleDelete(question.id)}
//                         >
//                           <Trash2 className="h-3 w-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Tâches orales */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Mic className="h-5 w-5 text-purple-600" />
//               Tâches orales ({audioQuestions.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {audioQuestions.length === 0 ? (
//               <p className="text-gray-500 text-center py-8">Aucune tâche orale créée pour l’instant</p>
//             ) : (
//               <div className="space-y-4">
//                 {audioQuestions.map((question) => (
//                   <div key={question.id} className="border rounded-lg p-4">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <h4 className="font-medium">{question.title}</h4>
//                         {question.imageUrl && (
//                           <div className="mt-2 mb-2">
//                             <Badge variant="outline" className="flex items-center gap-1 w-fit">
//                               <Image className="h-3 w-3" />
//                               Avec image
//                             </Badge>
//                           </div>
//                         )}
//                         <p className="text-gray-600 text-sm mt-1 line-clamp-2">
//                           {question.content}
//                         </p>
//                         <div className="flex gap-2 mt-2">
//                           <Badge variant="secondary">⏱️ {question.timeLimit} min</Badge>
//                         </div>
//                       </div>
//                       <div className="flex gap-2 ml-4">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleEdit(question)}
//                         >
//                           <Edit className="h-3 w-3" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => handleDelete(question.id)}
//                         >
//                           <Trash2 className="h-3 w-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }





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

interface SubtaskForm {
  id: number;
  title: string;
  instruction: string;
  suggestedWordCount: string;
}

export function AdminInterface() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    type: 'writing' | 'audio',
    title: string,
    content: string,
    imageUrl: string,
    timeLimit: number,
    wordLimit?: number
  }>({
    type: 'writing',
    title: '',
    content: '',
    imageUrl: '',
    timeLimit: 60,
    wordLimit: 400
  });

  // Subtasks for writing tasks
  const [subtasks, setSubtasks] = useState<SubtaskForm[]>([
    { id: 1, title: 'Tâche 1', instruction: '', suggestedWordCount: '60-80 mots' },
    { id: 2, title: 'Tâche 2', instruction: '', suggestedWordCount: '120-150 mots' },
    { id: 3, title: 'Tâche 3', instruction: '', suggestedWordCount: '160-180 mots' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    const savedQuestions = localStorage.getItem('tcf-questions');
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  };

  const saveQuestions = (updatedQuestions: Question[]) => {
    localStorage.setItem('tcf-questions', JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // For writing tasks, validate subtasks
    if (formData.type === 'writing') {
      const hasEmptySubtasks = subtasks.some(s => !s.instruction.trim());
      if (hasEmptySubtasks) {
        alert('Veuillez remplir toutes les instructions des sous-tâches pour les tâches écrites');
        return;
      }
    }

    const questionData: Question = {
      ...formData,
      id: editingId || Date.now().toString(),
      ...(formData.type === 'audio' ? { wordLimit: undefined, subtasks: undefined } : {
        subtasks: subtasks.filter(s => s.instruction.trim() !== '')
      })
    };

    let updatedQuestions;
    if (editingId) {
      updatedQuestions = questions.map(q => q.id === editingId ? questionData : q);
    } else {
      updatedQuestions = [...questions, questionData];
    }

    saveQuestions(updatedQuestions);
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
      wordLimit: question.wordLimit
    });

    // Load subtasks if it's a writing task
    if (question.type === 'writing' && question.subtasks) {
      const loadedSubtasks = question.subtasks.map(st => ({
        id: st.id,
        title: st.title,
        instruction: st.instruction,
        suggestedWordCount: st.suggestedWordCount || ''
      }));
      setSubtasks(loadedSubtasks);
    }

    setEditingId(question.id);
    setIsCreating(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image doit être inférieure à 5 Mo");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData({ ...formData, imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      const updatedQuestions = questions.filter(q => q.id !== id);
      saveQuestions(updatedQuestions);
    }
  };

  const updateSubtask = (index: number, field: keyof SubtaskForm, value: string) => {
    const updatedSubtasks = subtasks.map((subtask, i) => 
      i === index ? { ...subtask, [field]: value } : subtask
    );
    setSubtasks(updatedSubtasks);
  };

  const writingQuestions = questions.filter(q => q.type === 'writing');
  const audioQuestions = questions.filter(q => q.type === 'audio');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Panneau d'administration TCF Canada</h2>
          <p className="text-gray-600 mt-1">Créer et gérer les tâches d'expression écrite et orale</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          Ajouter une nouvelle tâche
        </Button>
      </div>

      {/* Formulaire de création/édition */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
            </CardTitle>
            <CardDescription>
              {formData.type === 'writing' 
                ? 'Les tâches écrites comprennent 3 sous-tâches avec un chronomètre commun'
                : 'Configuration d\'une tâche d\'expression orale'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de tâche</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Durée totale (minutes)</Label>
                  <Input
                    id="timeLimit"
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

              <div className="space-y-2">
                <Label htmlFor="title">Titre de la tâche</Label>
                <Input
                  id="title"
                  placeholder="ex: Expression écrite - Environnement et développement durable"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {formData.type === 'writing' && (
                <div className="space-y-2">
                  <Label htmlFor="wordLimit">Nombre de mots total suggéré</Label>
                  <Input
                    id="wordLimit"
                    type="number"
                    min="200"
                    max="800"
                    value={formData.wordLimit ?? ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      wordLimit: e.target.value === '' ? undefined : parseInt(e.target.value)
                    })}
                    placeholder="Somme suggérée pour les 3 sous-tâches"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">Contexte général / Document de référence</Label>
                <Textarea
                  id="content"
                  placeholder="Décrivez le contexte, le sujet ou fournissez le document sur lequel les étudiants vont travailler..."
                  className="min-h-[100px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image ou document (optionnel)</Label>
                <div className="space-y-3">
                  <Input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  
                  {formData.imageUrl && (
                    <div className="space-y-2">
                      <div className="border rounded-lg overflow-hidden bg-gray-50">
                        <img 
                          src={formData.imageUrl} 
                          alt="Aperçu du document" 
                          className="w-full max-h-64 object-contain"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={removeImage}
                        className="flex items-center gap-2"
                      >
                        <X className="h-3 w-3" />
                        Supprimer l'image
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtasks for writing tasks */}
              {formData.type === 'writing' && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Configuration des 3 sous-tâches</h3>
                    <Alert className="mb-4">
                      <AlertDescription>
                        Définissez les 3 sous-tâches que l'étudiant devra accomplir dans le temps imparti. Chaque sous-tâche aura sa propre consigne mais partageront le même chronomètre.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-4">
                      {subtasks.map((subtask, index) => (
                        <Card key={subtask.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Label>Titre de la tâche</Label>
                                <Input
                                  value={subtask.title}
                                  onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                                  placeholder={`Tâche ${subtask.id}`}
                                />
                              </div>
                              <div className="w-40">
                                <Label>Mots suggérés</Label>
                                <Input
                                  value={subtask.suggestedWordCount}
                                  onChange={(e) => updateSubtask(index, 'suggestedWordCount', e.target.value)}
                                  placeholder="ex: 60-80 mots"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Consigne de la tâche</Label>
                              <Textarea
                                value={subtask.instruction}
                                onChange={(e) => updateSubtask(index, 'instruction', e.target.value)}
                                placeholder={`Décrivez ce que l'étudiant doit faire dans la ${subtask.title.toLowerCase()}...`}
                                className="min-h-[80px]"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleSubmit} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Mettre à jour' : 'Créer la tâche'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aperçu des questions */}
      <div className="grid gap-6">
        <Alert>
          <AlertDescription>
            Total de tâches : {questions.length} ({writingQuestions.length} écrites, {audioQuestions.length} orales)
          </AlertDescription>
        </Alert>

        {/* Tâches écrites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-green-600" />
              Tâches d'expression écrite ({writingQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {writingQuestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune tâche écrite créée pour l'instant</p>
            ) : (
              <div className="space-y-4">
                {writingQuestions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{question.title}</h4>
                        {question.imageUrl && (
                          <div className="mt-2 mb-2">
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Image className="h-3 w-3" />
                              Avec document
                            </Badge>
                          </div>
                        )}
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {question.content}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="secondary">⏱️ {question.timeLimit} min</Badge>
                          {question.wordLimit && (
                            <Badge variant="secondary">📝 {question.wordLimit} mots</Badge>
                          )}
                        </div>
                        {question.subtasks && (
                          <div className="mt-3 text-sm">
                            <p className="text-gray-600 font-medium mb-1">Sous-tâches :</p>
                            <div className="space-y-1">
                              {question.subtasks.map(subtask => (
                                <div key={subtask.id} className="text-gray-500 text-xs">
                                  • {subtask.title}: {subtask.instruction.substring(0, 50)}...
                                  {subtask.suggestedWordCount && (
                                    <span className="text-blue-600"> ({subtask.suggestedWordCount})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(question.id)}
                        >
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

        {/* Tâches orales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-600" />
              Tâches d'expression orale ({audioQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {audioQuestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune tâche orale créée pour l'instant</p>
            ) : (
              <div className="space-y-4">
                {audioQuestions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{question.title}</h4>
                        {question.imageUrl && (
                          <div className="mt-2 mb-2">
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Image className="h-3 w-3" />
                              Avec document
                            </Badge>
                          </div>
                        )}
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {question.content}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">⏱️ {question.timeLimit} min</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(question.id)}
                        >
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