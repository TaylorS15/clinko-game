import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { getProviders, signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/server/auth';

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-rich-black-blue to-ultra-violet">
      {providers &&
        Object.values(providers).map((provider) => (
          <button
            key={provider.name}
            className="w-64 rounded-md bg-seasalt/10 px-10 py-3 text-center font-semibold text-seasalt no-underline transition hover:bg-seasalt/20"
            onClick={() => void signIn(provider.id)}
          >
            Sign in with {provider.name}
          </button>
        ))}
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
