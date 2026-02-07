'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { flashcardCategories } from '../../data/flashcards';
import { saveFlashcardProgress, getProgressForCategory } from '../../utils/storage';

export default function FlashcardCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.category as string;

  const category = flashcardCategories.find((c) => c.id === categoryId);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (category) {
      const progress = getProgressForCategory(category.id);
      if (progress) {
        setCompletedCards(progress.completedCards);
      }
    }
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <button
            onClick={() => router.push('/patient/flashcards')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to flashcards
          </button>
        </div>
      </div>
    );
  }

  const currentCard = category.cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / category.cards.length) * 100;
  const isCurrentCardKnown = completedCards.includes(currentCard.id);
  const totalKnownCards = completedCards.length;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleKnow = () => {
    if (!isCurrentCardKnown) {
      const newCompletedCards = [...completedCards, currentCard.id];
      setCompletedCards(newCompletedCards);
      saveFlashcardProgress(category.id, newCompletedCards);

      if (newCompletedCards.length === category.cards.length) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
    handleNext();
  };

  const handleDontKnow = () => {
    handleNext();
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentCardIndex < category.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      setCurrentCardIndex(category.cards.length - 1);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your progress for this category?')) {
      setCompletedCards([]);
      saveFlashcardProgress(category.id, []);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: `linear-gradient(135deg, ${category.color}15 0%, white 50%, ${category.color}10 100%)`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
              <p className="text-gray-600">You've completed all cards in this category!</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/patient/flashcards')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-5xl mr-4">{category.icon}</div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: category.color }}>
                  {category.name}
                </h1>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {category.cards.length}
            </div>
            <div className="text-sm font-medium" style={{ color: category.color }}>
              {totalKnownCards} / {category.cards.length} mastered
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: category.color,
              }}
            />
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(totalKnownCards / category.cards.length) * 100}%`,
                backgroundColor: '#10b981',
              }}
            />
          </div>
        </div>

              {/* Flashcard – Debug + Fixed Version */}
<div className="relative mb-8 h-[420px] w-full perspective-1000">
  <div
    className={`relative h-full w-full cursor-pointer transition-transform duration-700 ease-in-out transform-style-3d ${
      isFlipped ? 'rotate-y-180' : ''
    }`}
    onClick={() => {
      console.log('Card clicked – flipping to:', !isFlipped); // ← debug log
      setIsFlipped((prev) => !prev);
    }}
  >
    {/* Front face */}
    <div
      className="absolute inset-0 backface-hidden flex flex-col items-center justify-center rounded-2xl shadow-2xl p-10 text-center bg-white border-4 overflow-hidden"
      style={{ borderColor: category.color }}
    >
      <div className="mb-6">
        <span
          className="inline-block px-5 py-2 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: category.color }}
        >
          Question
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 leading-tight px-4">
        {currentCard.front}
      </h2>
      <div className="text-gray-500 text-sm flex items-center mt-auto">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
        Click anywhere to flip
      </div>
    </div>

    {/* Back face */}
    <div
      className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center rounded-2xl shadow-2xl p-10 text-center overflow-hidden"
      style={{
        backgroundColor: `${category.color}15`,
        border: `4px solid ${category.color}`,
      }}
    >
      <div className="mb-6">
        <span
          className="inline-block px-5 py-2 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: category.color }}
        >
          Answer
        </span>
      </div>
      <p className="text-lg md:text-xl text-gray-800 leading-relaxed px-4">
        {currentCard.back}
      </p>
      <div className="text-gray-600 text-sm flex items-center mt-auto">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
        Click anywhere to flip back
      </div>
    </div>
  </div>
</div>

        {/* Controls */}
        <div className="flex flex-col space-y-4">
          {isFlipped && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDontKnow();
                }}
                className="px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Still Learning
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleKnow();
                }}
                className="px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Got It!
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handlePrevious}
              className="px-6 py-3 bg-white border-2 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
              style={{ borderColor: category.color }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Reset Progress
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 text-white rounded-xl hover:opacity-90 transition-colors font-medium flex items-center justify-center shadow-md"
              style={{ backgroundColor: category.color }}
            >
              Next
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Tip: Use arrow keys to navigate • Space to flip</p>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}