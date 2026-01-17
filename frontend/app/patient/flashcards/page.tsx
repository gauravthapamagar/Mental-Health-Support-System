"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen } from "lucide-react";
import Link from "next/link";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

interface FlashcardDeck {
  id: string;
  title: string;
  articleTitle: string;
  cardCount: number;
  cards: Flashcard[];
}

function FlashcardViewer({ deck }: { deck: FlashcardDeck }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = deck.cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + deck.cards.length) % deck.cards.length
    );
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">{deck.title}</h2>
          <p className="text-sm text-gray-600">From: {deck.articleTitle}</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Card {currentIndex + 1} of {deck.cards.length}
          </span>
          <span className="text-blue-600 font-medium">
            {currentCard.category}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / deck.cards.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div
        className="relative h-80 mb-6 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`absolute w-full h-full transition-all duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center p-8 text-white">
            <p className="text-2xl text-center font-medium">
              {currentCard.front}
            </p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center p-8 text-white rotate-y-180">
            <p className="text-xl text-center">{currentCard.back}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mb-6">
        Click card to flip
      </p>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const decks: FlashcardDeck[] = [
    {
      id: "1",
      title: "Anxiety Triggers",
      articleTitle: "Understanding Anxiety Triggers",
      cardCount: 8,
      cards: [
        {
          id: "1",
          front: "What is a common physical anxiety trigger?",
          back: "Lack of sleep, caffeine, and poor diet can trigger anxiety symptoms.",
          category: "Physical Triggers",
        },
        {
          id: "2",
          front: "What is cognitive distortion?",
          back: "Negative thought patterns that reinforce anxious feelings, like catastrophizing or black-and-white thinking.",
          category: "Mental Triggers",
        },
        {
          id: "3",
          front: "Name a social anxiety trigger",
          back: "Public speaking, meeting new people, or being the center of attention.",
          category: "Social Triggers",
        },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
        <p className="text-gray-600">
          Study and reinforce key concepts from articles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <FlashcardViewer deck={decks[0]} />
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold mb-4">Your Decks</h3>
            <div className="space-y-3">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="font-medium mb-1">{deck.title}</div>
                  <div className="text-sm text-gray-600">
                    {deck.cardCount} cards
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl">
            <BookOpen className="text-blue-600 mb-3" size={32} />
            <h3 className="font-bold mb-2">Create New Deck</h3>
            <p className="text-sm text-gray-700 mb-4">
              Read an article and generate flashcards automatically
            </p>
            <Link
              href="/patient/articles"
              className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
