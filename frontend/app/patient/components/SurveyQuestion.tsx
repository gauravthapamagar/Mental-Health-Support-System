'use client';

import React from 'react';
import { SurveyQuestion as SurveyQuestionType } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface SurveyQuestionProps {
  question: SurveyQuestionType;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
}

export default function SurveyQuestion({
  question,
  value,
  onChange,
  onBlur,
}: SurveyQuestionProps) {
  const renderQuestion = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3 mt-4">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option.id}
                  checked={value === option.id}
                  onChange={(e) => {
                    onChange(parseInt(e.target.value));
                    onBlur?.();
                  }}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="text-slate-700">{option.option_text}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="mt-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>{question.rating_min_label || 'Not at all'}</span>
                <span>{question.rating_max_label || 'Extremely'}</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {Array.from({
                  length: (question.rating_max ?? 5) - (question.rating_min ?? 0) + 1,
                }).map((_, idx) => {
                  const ratingValue = (question.rating_min ?? 0) + idx;
                  return (
                    <button
                      key={ratingValue}
                      onClick={() => {
                        onChange(ratingValue);
                        onBlur?.();
                      }}
                      className={`
                        w-12 h-12 rounded-lg font-semibold transition-all
                        ${
                          value === ratingValue
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                        }
                      `}
                    >
                      {ratingValue}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                onChange(true);
                onBlur?.();
              }}
              className={`
                flex-1 py-3 px-4 rounded-xl font-semibold transition-all
                ${
                  value === true
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }
              `}
            >
              Yes
            </button>
            <button
              onClick={() => {
                onChange(false);
                onBlur?.();
              }}
              className={`
                flex-1 py-3 px-4 rounded-xl font-semibold transition-all
                ${
                  value === false
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }
              `}
            >
              No
            </button>
          </div>
        );

      case 'text':
        return (
          <div className="mt-4">
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder="Please type your response..."
              className="w-full p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        );

      default:
        return <div className="text-slate-500">Unsupported question type</div>;
    }
  };

  return (
    <Card className="p-6 mb-6 border border-slate-200 hover:border-slate-300 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <Label className="text-lg font-semibold text-slate-900 block mb-2">
            {question.question_text}
            {question.is_required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.help_text && (
            <p className="text-sm text-slate-600 mb-2">{question.help_text}</p>
          )}
          {renderQuestion()}
        </div>
      </div>
    </Card>
  );
}
