import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { IconShield, IconBook, IconUsers, IconChartBar, IconSettings, IconDatabase } from '@tabler/icons-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Administration - PermisExpert',
  description: 'Interface d\'administration de la plateforme de formation'
};

export default function SignInViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2'
        )}
      >
        Retour
      </Link>

      {/* Panneau latéral admin */}
      <div className='bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative hidden h-full flex-col p-10 text-white lg:flex'>
        <div className='absolute inset-0 bg-black/20' />
        
        {/* Logo et titre admin */}
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm mr-3">
            <IconShield className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold">PermisExpert</span>
            <div className="text-sm text-white/70 font-normal">Administration</div>
          </div>
        </div>

        {/* Fonctionnalités admin */}
        <div className='relative z-20 mt-8 space-y-4'>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-3">Tableau de bord</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
                  <IconBook className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Gestion des contenus</p>
                  <p className="text-xs text-white/70">Séries, questions, médias</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20">
                  <IconUsers className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Gestion des utilisateurs</p>
                  <p className="text-xs text-white/70">Élèves, instructeurs, admins</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20">
                  <IconChartBar className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Analytics & Rapports</p>
                  <p className="text-xs text-white/70">Statistiques, performances</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20">
                  <IconSettings className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Configuration</p>
                  <p className="text-xs text-white/70">Paramètres, permissions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-3">Accès sécurisé</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <IconShield className="h-4 w-4 text-green-400" />
                <span>Authentification 2FA</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconDatabase className="h-4 w-4 text-blue-400" />
                <span>Données chiffrées</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconSettings className="h-4 w-4 text-purple-400" />
                <span>Logs d'audit complets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message admin */}
        <div className='relative z-20 mt-auto'>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IconShield className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-400 text-sm">Zone d'administration</p>
                <p className="text-xs text-white/80 mt-1">
                  Interface réservée aux administrateurs autorisés. 
                  Toutes les actions sont tracées et auditées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de connexion admin */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          
          {/* Header admin mobile */}
          <div className="lg:hidden text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100">
                <IconShield className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">PermisExpert</span>
                <div className="text-sm text-gray-600">Administration</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Connexion Admin</h1>
            <p className="text-gray-600">Accès réservé aux administrateurs</p>
          </div>

          {/* Badge sécurité */}
          <div className="flex gap-2 flex-wrap justify-center">
            <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
              <IconShield className="h-3 w-3 mr-1" />
              Accès sécurisé
            </Badge>
            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Zone Admin
            </Badge>
          </div>

          {/* Formulaire Clerk pour admin */}
          <div className="w-full">
            <ClerkSignInForm
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 w-full",
                  headerTitle: "hidden lg:block text-xl font-semibold text-slate-900",
                  headerSubtitle: "hidden lg:block text-slate-600",
                  socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium",
                  socialButtonsBlockButtonText: "text-gray-700 font-medium",
                  formButtonPrimary: "bg-slate-800 hover:bg-slate-900 text-white font-medium py-2",
                  footerActionLink: "text-slate-700 hover:text-slate-900 font-medium",
                  formFieldInput: "border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                }
              }}
              initialValues={{
                emailAddress: ''
              }}
            />
          </div>

          {/* Avertissement sécurité */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <IconShield className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Accès restreint</span>
            </div>
            <p className="text-xs text-amber-700">
              Cette interface est réservée aux administrateurs autorisés.
              Toutes les connexions sont enregistrées.
            </p>
          </div>

          {/* Liens d'aide admin */}
          

          {/* Footer légal admin */}
          <p className='text-muted-foreground px-2 text-center text-xs leading-relaxed'>
            En vous connectant, vous acceptez les{' '}
            <Link
              href='/admin/terms'
              className='hover:text-primary underline underline-offset-4 font-medium'
            >
              Conditions d'administration
            </Link>{' '}
            et la{' '}
            <Link
              href='/admin/security'
              className='hover:text-primary underline underline-offset-4 font-medium'
            >
              Politique de sécurité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}