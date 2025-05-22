type Props = {
  valueInches: number;
  onChange: (totalInches: number) => void;
};

export default function FeetInchesInput({ valueInches, onChange }: Props) {
  const feet = Math.floor(valueInches / 12);
  const inches = valueInches % 12;

  return (
    <div className="flex gap-1 items-center">
      <input
        type="number"
        min={0}
        value={feet}
        onChange={(e) => onChange(+e.target.value * 12 + inches)}
        className="w-12 border rounded px-1"
        placeholder="ft"
      />
      <span>'</span>
      <input
        type="number"
        min={0}
        max={11}
        step={1}
        value={inches}
        onChange={(e) => onChange(feet * 12 + +e.target.value)}
        className="w-12 border rounded px-1"
        placeholder="in"
      />
      <span>"</span>
    </div>
  );
}
