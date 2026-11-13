export default function PageHeader({ heading, intro }: { heading: string; intro: string }) {
  return (
    <div className="mb-6">
      <h1 tabIndex={-1} className="text-title-xl leading-title-xl font-semibold">
        {heading}
      </h1>
      <p className="mt-2 max-w-3xl text-xl text-secondary">{intro}</p>
    </div>
  );
}
