import produce from 'immer';

export function useProduceUpdater<T>(
  transform: T,
  onChange: (transform: T) => void
) {
  return (updater: (draft: T) => void) => {
    onChange(produce(transform, updater));
  };
}
