type SimpleLayoutProps = {
  rightChild: React.ReactNode;

  title: string;
  description: string;
};

export function SimpleLayout({
  title,
  description,
  rightChild,
}: SimpleLayoutProps) {
  return (
    <div className="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
      <div className="flex shrink-0 flex-col gap-2 p-4 ">
        <h1 className="text-3xl">{title}</h1>
        <p>{description}</p>
      </div>
      <div className="p-4 md:col-span-2">{rightChild}</div>
    </div>
  );
}
