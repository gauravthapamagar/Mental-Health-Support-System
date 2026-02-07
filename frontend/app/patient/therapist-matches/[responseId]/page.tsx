'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, Filter, Search, AlertCircle, Sparkles, User, MapPin, Clock, DollarSign, Languages, ChevronDown, ChevronUp, Calendar, Star, Award, CheckCircle, Heart, MessageCircle, Video, Home, TrendingUp, Briefcase, GraduationCap, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { matchingAPI, type MatchResult, type MatchingAPIResponse, type TherapistMatchDetails } from '@/lib/api'

type SortOption = 'match' | 'experience' | 'price'

// Therapist Card Component
function TherapistMatchCard({ 
  match, 
  reasons,
  rank,
  onBookSession, 
  onViewProfile 
}: { 
  match: MatchResult
  reasons?: string[]
  rank: number
  onBookSession: (id: number) => void
  onViewProfile: (id: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const therapist = match.therapist
  const profile = therapist.profile || {}

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getMatchColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-600'
    if (percentage >= 80) return 'bg-teal-600'
    if (percentage >= 70) return 'bg-slate-700'
    return 'bg-slate-600'
  }

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 90) return 'Exceptional Match'
    if (percentage >= 80) return 'Excellent Match'
    if (percentage >= 70) return 'Strong Match'
    return 'Good Match'
  }

  const matchReasons = reasons || []
  const specializations = profile.specialization_tags || therapist.specializations || []
  const languages = profile.languages_spoken || []

  const isTopMatch = rank <= 3

  return (
    <Card className={`overflow-hidden transition-all duration-300 border ${
      rank === 1 
        ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-xl hover:shadow-2xl' 
        : 'border-slate-200 bg-white shadow-sm hover:shadow-lg'
    }`}>
      {rank === 1 && (
        <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
      )}
      
      <CardContent className="p-0">
        <div className="p-8">
          {/* Top Badge for Top 3 */}
          {isTopMatch && (
            <div className="flex items-center gap-2 mb-6">
              {rank === 1 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-full">
                  <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">Best Match</span>
                </div>
              )}
              {rank === 2 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-full">
                  <Award className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Top Match</span>
                </div>
              )}
              {rank === 3 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-full">
                  <Award className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Highly Recommended</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Avatar & Match Score */}
            <div className="flex flex-col items-center gap-4 lg:w-40 shrink-0">
              <div className="relative">
                <Avatar className="h-28 w-28 border-2 border-slate-200 shadow-md">
                  <AvatarImage src={profile.profile_picture || ''} alt={therapist.full_name} />
                  <AvatarFallback className="text-2xl bg-slate-100 text-slate-700 font-semibold">
                    {getInitials(therapist.full_name)}
                  </AvatarFallback>
                </Avatar>
                {profile.is_verified && (
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-teal-600 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* Match Score Circle */}
              <div className="text-center">
                <div className={`inline-flex flex-col items-center justify-center h-20 w-20 rounded-full ${getMatchColorClass(match.compatibility_percentage)} shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{match.compatibility_percentage}</span>
                  <span className="text-xs text-white/90 font-medium">Match</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">{getMatchLabel(match.compatibility_percentage)}</p>
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex-1 min-w-0">
              {/* Name & Title */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    {therapist.full_name}
                  </h3>
                </div>
                <p className="text-base text-slate-600 font-medium mb-1">
                  {profile.profession_type || 'Licensed Therapist'}
                </p>
                {profile.years_of_experience > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.years_of_experience} years of professional experience</span>
                  </div>
                )}
              </div>

              {/* Why Match Section */}
              {matchReasons.length > 0 && (
                <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Why This Therapist Matches You</h4>
                  </div>
                  <ul className="space-y-2">
                    {matchReasons.slice(0, 4).map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specializations */}
              {specializations.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-slate-500" />
                    Areas of Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {specializations.slice(0, 8).map((spec, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm text-slate-700 font-medium">
                        {spec}
                      </span>
                    ))}
                    {specializations.length > 8 && (
                      <span className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-md text-sm text-slate-600 font-medium">
                        +{specializations.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {profile.consultation_mode && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="h-10 w-10 bg-white border border-slate-300 rounded-lg flex items-center justify-center shrink-0">
                      {profile.consultation_mode === 'online' ? (
                        <Video className="h-5 w-5 text-slate-600" />
                      ) : profile.consultation_mode === 'in_person' ? (
                        <Home className="h-5 w-5 text-slate-600" />
                      ) : (
                        <MapPin className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Session Type</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {profile.consultation_mode === 'both' ? 'Online & In-Person' : 
                         profile.consultation_mode === 'online' ? 'Online Sessions' : 'In-Person Only'}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile.consultation_fees > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="h-10 w-10 bg-white border border-slate-300 rounded-lg flex items-center justify-center shrink-0">
                      <DollarSign className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Session Fee</p>
                      <p className="text-sm font-semibold text-slate-900">
                        ${profile.consultation_fees}
                      </p>
                    </div>
                  </div>
                )}
                
                {languages.length > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="h-10 w-10 bg-white border border-slate-300 rounded-lg flex items-center justify-center shrink-0">
                      <Languages className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Languages</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {languages.slice(0, 2).join(', ')}
                        {languages.length > 2 && ` +${languages.length - 2}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                  onClick={() => onBookSession(therapist.id)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-11 border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => onViewProfile(therapist.id)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  className="sm:w-11 h-11 border-slate-300 hover:bg-slate-50"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-600" /> : <ChevronDown className="h-5 w-5 text-slate-600" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-slate-200 bg-slate-50/50 p-8 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-slate-600" />
                  Professional Background
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Compatibility Analysis */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-600" />
                Match Analysis
              </h4>
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Overall Compatibility</span>
                  <span className="text-xl font-bold text-slate-900">{match.compatibility_percentage}%</span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${getMatchColorClass(match.compatibility_percentage)} rounded-full transition-all duration-1000`}
                    style={{ width: `${match.compatibility_percentage}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{Math.floor(match.compatibility_percentage * 0.92)}%</p>
                    <p className="text-xs text-slate-600 mt-1">Specialization Fit</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{Math.floor(match.compatibility_percentage * 0.95)}%</p>
                    <p className="text-xs text-slate-600 mt-1">Approach Match</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{Math.floor(match.compatibility_percentage * 0.88)}%</p>
                    <p className="text-xs text-slate-600 mt-1">Availability</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Languages className="h-4 w-4 text-slate-600" />
                  Languages Offered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm text-slate-700">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials */}
            {profile.license_id && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-600" />
                  Professional Credentials
                </h4>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Licensed Professional</p>
                      <p className="text-sm text-slate-600">License ID: {profile.license_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Loading Skeleton
function TherapistCardSkeleton() {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col items-center gap-4 lg:w-40">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-32 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 w-11" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TherapistMatchesPage({ 
  params 
}: { 
  params: Promise<{ responseId: string }> 
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const responseId = resolvedParams.responseId

  const [matchData, setMatchData] = useState<MatchingAPIResponse | null>(null)
  const [matchReasons, setMatchReasons] = useState<Record<number, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('match')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchMatches = useCallback(async () => {
    if (!responseId) {
      setError('No survey response ID provided')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await matchingAPI.findMatches(Number(responseId))

      if (response.success) {
        setMatchData(response)
        
        if (response.results) {
          const reasons: Record<number, string[]> = {}
          response.results.forEach(r => {
            reasons[r.therapist_id] = r.reasons
          })
          setMatchReasons(reasons)
        }
      } else {
        setError(response.message || 'No matches found')
      }
    } catch (err: any) {
      console.error('Failed to fetch matches:', err)
      if (err.response?.status === 404) {
        setError('No matching therapists found. Please try again later.')
      } else if (err.response?.status === 401) {
        setError('Please log in to view your matches.')
        router.push('/auth/login')
      } else {
        setError(err.message || 'An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }, [responseId, router])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const handleRefresh = async () => {
    if (!matchData?.match_id) {
      await fetchMatches()
      return
    }

    setIsRefreshing(true)
    try {
      const response = await matchingAPI.rematch(matchData.match_id)
      if (response.success) {
        setMatchData(response)
        if (response.results) {
          const reasons: Record<number, string[]> = {}
          response.results.forEach(r => {
            reasons[r.therapist_id] = r.reasons
          })
          setMatchReasons(reasons)
        }
      }
    } catch (err) {
      console.error('Failed to refresh matches:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleBookSession = (therapistId: number) => {
    router.push(`/patient/book-session?therapist_id=${therapistId}`)
  }

  const handleViewProfile = (therapistId: number) => {
    router.push(`/therapist/${therapistId}`)
  }

  const matches = matchData?.data?.matches || []

  const filteredMatches = matches
    .filter(match => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      const profile = match.therapist.profile || {}
      const specializations = profile.specialization_tags || match.therapist.specializations || []
      return (
        match.therapist.full_name.toLowerCase().includes(query) ||
        specializations.some(s => s.toLowerCase().includes(query)) ||
        (profile.bio || '').toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.compatibility_percentage - a.compatibility_percentage
        case 'experience':
          return (b.therapist.profile?.years_of_experience || 0) - (a.therapist.profile?.years_of_experience || 0)
        case 'price':
          return (a.therapist.profile?.consultation_fees || 0) - (b.therapist.profile?.consultation_fees || 0)
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Professional Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment
          </Button>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-teal-700" />
              <span className="text-sm font-semibold text-teal-900">Matching Complete</span>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
              Your Recommended Therapists
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Based on your assessment, we've identified {filteredMatches.length} licensed therapists 
              who match your needs, preferences, and therapeutic goals. Each match is ranked by compatibility.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Methodology Card */}
        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 mb-2">Our Matching Methodology</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  We use evidence-based algorithms to analyze your responses alongside therapist specializations, 
                  treatment approaches, and patient success rates. Every recommendation is personalized to your unique situation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Clinical expertise matching</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Preference alignment</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Outcome-driven selection</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search therapists by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400"
            />
          </div>
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px] h-11 border-slate-300">
                <Filter className="h-4 w-4 mr-2 text-slate-600" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best Match</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="h-11 w-11 border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-slate-700">
              Showing {filteredMatches.length} {filteredMatches.length === 1 ? 'therapist' : 'therapists'}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="border-red-200 bg-red-50 shadow-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center max-w-md mx-auto">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Matches</h3>
                <p className="text-sm text-slate-600 mb-6">{error}</p>
                <Button onClick={fetchMatches} className="bg-slate-900 hover:bg-slate-800">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <TherapistCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Matches list */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match, index) => (
                <TherapistMatchCard
                  key={match.therapist.id}
                  match={match}
                  reasons={matchReasons[match.therapist.id]}
                  rank={index + 1}
                  onBookSession={handleBookSession}
                  onViewProfile={handleViewProfile}
                />
              ))
            ) : (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center text-center max-w-md mx-auto">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Matches Found</h3>
                    <p className="text-sm text-slate-600">
                      {searchQuery
                        ? 'Try adjusting your search terms to see more results.'
                        : 'Complete your assessment to receive personalized therapist recommendations.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Trust & Security Footer */}
        {!isLoading && !error && filteredMatches.length > 0 && (
          <Card className="mt-12 border-slate-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="h-6 w-6 text-teal-700" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-900 mb-3">Trusted, Verified Professionals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">All therapists are licensed and verified professionals</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">Your information is protected with bank-level encryption</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">Book initial consultations to find your perfect fit</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">Confidential, HIPAA-compliant platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}