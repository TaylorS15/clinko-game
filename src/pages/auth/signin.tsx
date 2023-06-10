import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { getProviders, signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/server/auth';
import Google from '../../../public/assets/google.webp';
import Github from '../../../public/assets/github.webp';
import Image from 'next/image';
import Faq from '~/components/Faq';

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-rich-black-blue">
      <div>
        <div className="mt-8 flex h-32 w-full flex-col items-center">
          <h1 className="text-center text-6xl font-bold text-slate-200">
            Clinko
          </h1>
          <p className="w-96 text-center text-2xl font-bold text-slate-200">
            Click to collect <span className="text-green-400">millions</span>{' '}
            and <span className="text-orange-400">billions</span> and{' '}
            <span className="text-rose-400">trillions</span> of clinks!
          </p>
        </div>
      </div>
      {providers &&
        Object.values(providers).map((provider) => (
          <button
            key={provider.name}
            className="flex w-max gap-6 rounded-md bg-seasalt/10  px-10 py-3 text-center font-semibold text-seasalt no-underline transition hover:bg-seasalt/20"
            onClick={() => void signIn(provider.id)}
          >
            <Image
              src={provider.name === 'Google' ? Google : Github}
              alt={provider.name}
              className="mr-2 inline-block h-8 w-8 rounded-lg"
            />
            <p className="my-auto">Sign in with {provider.name}</p>
          </button>
        ))}
      <Faq />
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: '/' } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}
