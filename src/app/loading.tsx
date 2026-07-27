import { Loader } from '@/components/Loader';

export default function HomeLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader />
    </div>
  );
}
