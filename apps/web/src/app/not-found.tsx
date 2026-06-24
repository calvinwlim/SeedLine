import { Container } from '../components/ui/container';
import { ButtonLink } from '../components/ui/button';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-6">
        <ButtonLink href="/">Back home</ButtonLink>
      </div>
    </Container>
  );
}
