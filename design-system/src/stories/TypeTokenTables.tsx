export const ScaleTable = () => {
  const scales = [
    { token: 'text-xs', size: '12px', lineHeight: '16px' },
    { token: 'text-sm', size: '14px', lineHeight: '20px' },
    { token: 'text-base', size: '16px', lineHeight: '24px' },
    { token: 'text-lg', size: '18px', lineHeight: '28px' },
    { token: 'text-xl', size: '20px', lineHeight: '28px' },
    { token: 'text-2xl', size: '24px', lineHeight: '32px' },
    { token: 'text-3xl', size: '30px', lineHeight: '36px' },
    { token: 'text-4xl', size: '36px', lineHeight: '40px' },
  ];

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-3 font-medium text-sm text-muted-foreground">Token</th>
            <th className="p-3 font-medium text-sm text-muted-foreground w-24">Size</th>
            <th className="p-3 font-medium text-sm text-muted-foreground w-24">Line Height</th>
          </tr>
        </thead>
        <tbody>
          {scales.map((scale, index) => (
            <tr
              key={scale.token}
              className={index % 2 === 1 ? 'bg-muted/5 border-t border-border' : 'border-t border-border'}
            >
              <td className="p-3 font-mono text-xs text-muted-foreground">{scale.token}</td>
              <td className="p-3 text-xs text-muted-foreground">{scale.size}</td>
              <td className="p-3 text-xs text-muted-foreground">{scale.lineHeight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const WeightsTable = () => {
  const weights = [
    { token: 'font-normal', weight: '400' },
    { token: 'font-medium', weight: '500' },
    { token: 'font-semibold', weight: '600' },
    { token: 'font-bold', weight: '700' },
    { token: 'font-extrabold', weight: '800' },
  ];

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-3 font-medium text-sm text-muted-foreground">Token</th>
            <th className="p-3 font-medium text-sm text-muted-foreground w-24">Weight</th>
          </tr>
        </thead>
        <tbody>
          {weights.map((weight, index) => (
            <tr
              key={weight.token}
              className={index % 2 === 1 ? 'bg-muted/5 border-t border-border' : 'border-t border-border'}
            >
              <td className="p-3 font-mono text-xs text-muted-foreground">{weight.token}</td>
              <td className="p-3 text-xs text-muted-foreground">{weight.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
