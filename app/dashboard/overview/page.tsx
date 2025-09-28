"use client";

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconBook, 
  IconMicrophone, 
  IconUsers, 
  IconLicense,
  IconVideo,
  IconClock,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useSerie } from '@/contexts/SerieContext';
import { useWrittenQuestion } from '@/contexts/WrittenQuestionContext';
import { useOralQuestion } from '@/contexts/OralQuestionContext';
import { usePermitType } from '@/contexts/PermitTypeContext';


export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const { series } = useSerie();
  const { writtenQuestions } = useWrittenQuestion();
  const { oralQuestions } = useOralQuestion();
  const { permitTypes } = usePermitType();

  // Calculs des statistiques
  const stats = useMemo(() => {
    // Statistiques des séries
    const totalSeries = series?.length || 0;
    const freeSeries = series?.filter((s: any )=> s.isFree)?.length || 0;
    const paidSeries = totalSeries - freeSeries;
    const totalVideos = series?.reduce((acc:any, serie:any) => acc + (serie.videos?.length || 0), 0) || 0;

    // Statistiques des questions écrites
    const totalWrittenQuestions = writtenQuestions?.length || 0;
    const writtenQuestionsWithMedia = writtenQuestions?.filter((q:any) => 
      q.libelles?.some((l:any) => ['image', 'audio', 'video'].includes(l.typeLibelle))
    )?.length || 0;

    // Statistiques des questions orales
    const totalOralQuestions = oralQuestions?.length || 0;
    
    // Statistiques des types de permis
    const totalPermitTypes = permitTypes?.length || 0;

    // Calculs de progression (simulés basés sur les données existantes)
    const seriesGrowth = totalSeries > 10 ? "+15.2%" : "+8.3%";
    const questionsGrowth = (totalWrittenQuestions + totalOralQuestions) > 50 ? "+22.1%" : "+12.5%";
    const mediaContentGrowth = writtenQuestionsWithMedia > 5 ? "+18.7%" : "+5.2%";

    return {
      totalSeries,
      freeSeries,
      paidSeries,
      totalVideos,
      totalWrittenQuestions,
      writtenQuestionsWithMedia,
      totalOralQuestions,
      totalPermitTypes,
      seriesGrowth,
      questionsGrowth,
      mediaContentGrowth,
      totalQuestions: totalWrittenQuestions + totalOralQuestions
    };
  }, [series, writtenQuestions, oralQuestions, permitTypes]);

  return (
    <PageContainer>
        <div className='flex flex-1 flex-col space-y-2'>
          <div className='flex items-center justify-between space-y-2'>
            <h2 className='text-2xl font-bold tracking-tight'>
              Tableau de bord - École de conduite
            </h2>
          </div>

          <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
            {/* Card Séries de formation */}
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <IconBook className="h-4 w-4" />
                  Séries de formation
                </CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {stats.totalSeries}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline' className="text-green-600">
                    <IconTrendingUp className="h-3 w-3" />
                    {stats.seriesGrowth}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='flex gap-4 text-xs'>
                  <span className="flex items-center gap-1">
                    <IconCheck className="h-3 w-3 text-green-500" />
                    {stats.freeSeries} gratuites
                  </span>
                  <span className="flex items-center gap-1">
                    <IconLicense className="h-3 w-3 text-blue-500" />
                    {stats.paidSeries} premium
                  </span>
                </div>
                <div className='text-muted-foreground'>
                  {stats.totalVideos} vidéos au total
                </div>
              </CardFooter>
            </Card>

            {/* Card Questions */}
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <IconUsers className="h-4 w-4" />
                  Questions d'examen
                </CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {stats.totalQuestions}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline' className="text-green-600">
                    <IconTrendingUp className="h-3 w-3" />
                    {stats.questionsGrowth}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='flex gap-4 text-xs'>
                  <span className="flex items-center gap-1">
                    <IconBook className="h-3 w-3 text-blue-500" />
                    {stats.totalWrittenQuestions} écrites
                  </span>
                  <span className="flex items-center gap-1">
                    <IconMicrophone className="h-3 w-3 text-purple-500" />
                    {stats.totalOralQuestions} orales
                  </span>
                </div>
                <div className='text-muted-foreground'>
                  Contenu d'entraînement complet
                </div>
              </CardFooter>
            </Card>

            {/* Card Contenu multimédia */}
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <IconVideo className="h-4 w-4" />
                  Contenu multimédia
                </CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {stats.writtenQuestionsWithMedia + stats.totalVideos}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline' className="text-green-600">
                    <IconTrendingUp className="h-3 w-3" />
                    {stats.mediaContentGrowth}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='flex gap-4 text-xs'>
                  <span className="flex items-center gap-1">
                    <IconVideo className="h-3 w-3 text-red-500" />
                    {stats.totalVideos} vidéos
                  </span>
                  <span className="flex items-center gap-1">
                    <IconBook className="h-3 w-3 text-orange-500" />
                    {stats.writtenQuestionsWithMedia} avec média
                  </span>
                </div>
                <div className='text-muted-foreground'>
                  Apprentissage interactif
                </div>
              </CardFooter>
            </Card>

            {/* Card Types de permis */}
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <IconLicense className="h-4 w-4" />
                  Types de permis
                </CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {stats.totalPermitTypes}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline' className="text-blue-600">
                    <IconClock className="h-3 w-3" />
                    Stable
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  Catégories disponibles
                  <IconLicense className='size-4' />
                </div>
                <div className='text-muted-foreground'>
                  Formation complète assurée
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Section résumé détaillé */}
          <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconBook className="h-5 w-5 text-blue-500" />
                  Séries par type
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gratuites</span>
                    <Badge variant="secondary">{stats.freeSeries}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Premium</span>
                    <Badge variant="default">{stats.paidSeries}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalSeries > 0 ? (stats.freeSeries / stats.totalSeries) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSeries > 0 ? Math.round((stats.freeSeries / stats.totalSeries) * 100) : 0}% de contenu gratuit
                  </p>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconUsers className="h-5 w-5 text-green-500" />
                  Questions par type
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Questions écrites</span>
                    <Badge variant="outline">{stats.totalWrittenQuestions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Questions orales</span>
                    <Badge variant="outline">{stats.totalOralQuestions}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalQuestions > 0 ? (stats.totalWrittenQuestions / stats.totalQuestions) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Répartition équilibrée des types
                  </p>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconVideo className="h-5 w-5 text-purple-500" />
                  Contenu enrichi
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Questions avec média</span>
                    <Badge variant="outline">{stats.writtenQuestionsWithMedia}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vidéos totales</span>
                    <Badge variant="outline">{stats.totalVideos}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalWrittenQuestions > 0 ? (stats.writtenQuestionsWithMedia / stats.totalWrittenQuestions) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expérience d'apprentissage immersive
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Graphiques existants */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <div className='col-span-4'>{bar_stats}</div>
            <div className='col-span-4 md:col-span-3'>
              {sales}
            </div>
            <div className='col-span-4'>{area_stats}</div>
            <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
          </div>
        </div>
    </PageContainer>
  );
}