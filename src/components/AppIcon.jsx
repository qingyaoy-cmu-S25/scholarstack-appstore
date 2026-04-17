export default function AppIcon({ app, size = 40 }) {
  return (
    <div
      className={`${app.color} text-white font-semibold rounded-full flex items-center justify-center shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {app.initials}
    </div>
  );
}
