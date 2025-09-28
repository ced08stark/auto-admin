import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { IconShield, IconUserPlus, IconKey, IconDatabase, IconSettings, IconBook, IconUsers } from '@tabler/icons-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Création de compte Admin - PermisExpert',
  description: 'Création de compte administrateur pour la plateforme de formation'
};

export default function SignUpViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/admin/sign-in'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2'
        )}
      >
        <IconShield className="h-4 w-4" />
        Se connecter
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

        {/* Process de création de compte */}
        <div className='relative z-20 mt-8 space-y-4'>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <IconUserPlus className="h-5 w-5" />
              Processus de création
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Informations de base</p>
                  <p className="text-xs text-white/70">Email, nom, prénom</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Validation par admin senior</p>
                  <p className="text-xs text-white/70">Approbation requise</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Attribution des rôles</p>
                  <p className="text-xs text-white/70">Permissions configurées</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <IconKey className="h-5 w-5" />
              Rôles administrateurs
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <IconShield className="h-4 w-4 text-red-400" />
                <span className="text-white/90">Super Admin</span>
                <span className="text-xs text-white/60">(accès complet)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconBook className="h-4 w-4 text-blue-400" />
                <span className="text-white/90">Gestionnaire de contenu</span>
                <span className="text-xs text-white/60">(séries, questions)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconUsers className="h-4 w-4 text-green-400" />
                <span className="text-white/90">Gestionnaire utilisateurs</span>
                <span className="text-xs text-white/60">(élèves, instructeurs)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconDatabase className="h-4 w-4 text-purple-400" />
                <span className="text-white/90">Analyste</span>
                <span className="text-xs text-white/60">(rapports, stats)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message sécurité */}
        <div className='relative z-20 mt-auto'>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IconShield className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400 text-sm">Compte en attente d'approbation</p>
                <p className="text-xs text-white/80 mt-1">
                  Après inscription, votre compte sera soumis à validation par un administrateur senior. 
                  Vous recevrez un email de confirmation une fois approuvé.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'inscription admin */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          
          {/* Header admin mobile */}
          <div className="lg:hidden text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100">
                <IconUserPlus className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">PermisExpert</span>
                <div className="text-sm text-gray-600">Administration</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte admin</h1>
            <p className="text-gray-600">Demande de création de compte administrateur</p>
          </div>

          {/* Badges information */}
          <div className="flex gap-2 flex-wrap justify-center">
            <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              <IconKey className="h-3 w-3 mr-1" />
              Approbation requise
            </Badge>
            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              <IconShield className="h-3 w-3 mr-1" />
              Accès sécurisé
            </Badge>
          </div>

          {/* Formulaire Clerk pour admin */}
          <div className="w-full">
            <ClerkSignUpForm
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

          {/* Information importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconSettings className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Information importante</span>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Votre demande sera examinée par un administrateur senior. 
              Un email vous sera envoyé avec les détails de votre rôle et permissions une fois approuvée.
            </p>
          </div>

          {/* Déjà un compte */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Déjà un compte administrateur ?{' '}
              <Link href="/admin/sign-in" className="text-slate-700 hover:text-slate-900 font-medium">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Footer légal admin */}
          <p className='text-muted-foreground px-2 text-center text-xs leading-relaxed'>
            En créant un compte, vous acceptez les{' '}
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
              Charte de sécurité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}