import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { type LegalArea, type QuestionnaireResponse } from '@/types/legal';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuestionnaireFormProps {
  area: LegalArea;
  onComplete: (responses: QuestionnaireResponse[]) => void;
  onBack: () => void;
}

export function QuestionnaireForm({ area, onComplete, onBack }: QuestionnaireFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);

  const currentQuestion = area.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / area.questions.length) * 100;

  const getCurrentResponse = () => {
    return responses.find(r => r.questionId === currentQuestion.id);
  };

  const handleRadioChange = (value: string) => {
    const newResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    newResponses.push({
      questionId: currentQuestion.id,
      answer: value,
    });
    setResponses(newResponses);
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const currentResponse = getCurrentResponse();
    let currentAnswers = Array.isArray(currentResponse?.answer) ? currentResponse.answer : [];

    if (checked) {
      currentAnswers = [...currentAnswers, value];
    } else {
      currentAnswers = currentAnswers.filter(v => v !== value);
    }

    const newResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    newResponses.push({
      questionId: currentQuestion.id,
      answer: currentAnswers,
    });
    setResponses(newResponses);
  };

  const handleTextareaChange = (value: string) => {
    const newResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    newResponses.push({
      questionId: currentQuestion.id,
      answer: value,
    });
    setResponses(newResponses);
  };

  const canProceed = () => {
    const response = getCurrentResponse();
    if (!response) return false;

    if (currentQuestion.type === 'checkbox') {
      return Array.isArray(response.answer) && response.answer.length > 0;
    }
    if (currentQuestion.type === 'radio') {
      return typeof response.answer === 'string' && response.answer.length > 0;
    }
    if (currentQuestion.type === 'textarea') {
      return typeof response.answer === 'string' && response.answer.trim().length > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (currentQuestionIndex < area.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(responses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2" />
          Voltar às Áreas
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{area.name}</CardTitle>
          <p className="text-sm text-zinc-600">{area.description}</p>
        </CardHeader>
      </Card>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-zinc-600 mb-2">
          <span>Questão {currentQuestionIndex + 1} de {area.questions.length}</span>
          <span>{Math.round(progress)}% completo</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          {
            currentQuestion.note &&
            <p className="text-sm text-zinc-600">{currentQuestion.note}</p>
          }
          <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {currentQuestion.type === 'radio' && currentQuestion.options && (() => {
          const currentAnswer: string =
            typeof getCurrentResponse()?.answer === 'string'
              ? getCurrentResponse()!.answer as string
              : '';

          return (
            <RadioGroup
              key={currentQuestion.id}
              value={currentAnswer}
              onValueChange={handleRadioChange}
            >
              {currentQuestion.options.map((option) => {
                const radioId = `${currentQuestion.id}_${option.value}`;

                return (
                  <div
                    key={radioId}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50"
                  >
                    <RadioGroupItem value={option.value} id={radioId} />
                    <Label htmlFor={radioId} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          );
        })()}


          {currentQuestion.type === 'checkbox' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const currentResponse = getCurrentResponse();
                const isChecked = Array.isArray(currentResponse?.answer) &&
                  currentResponse.answer.includes(option.value);

                return (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50">
                    <Checkbox
                      id={option.value}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckboxChange(option.value, checked === true)}
                    />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'textarea' && (
            <div>
              <Textarea
                placeholder="Digite sua resposta aqui..."
                value={typeof getCurrentResponse()?.answer === 'string' ? getCurrentResponse()!.answer as string : ''}
                onChange={(e) => handleTextareaChange(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2" />
              Anterior
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentQuestionIndex < area.questions.length - 1 ? (
                <>
                  Próxima
                  <ArrowRight className="ml-2" />
                </>
              ) : (
                'Finalizar Questionário'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
