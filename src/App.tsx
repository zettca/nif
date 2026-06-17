import { useState } from "react";
import { OTPFieldPreview as OTPField } from "@base-ui/react/otp-field";

const NIF_LENGTH = 9;
const WEIGHTS = [9, 8, 7, 6, 5, 4, 3, 2] as const;

interface EntityType {
  type: string;
  description: string;
  deprecated?: true;
}

// prettier-ignore
const ENTITY_MAP: Record<string, EntityType> = {
  "1": { type: "Pessoa Singular", description: "Contribuinte pessoa física (cidadão ou residente em Portugal)" },
  "2": { type: "Pessoa Singular", description: "Contribuinte pessoa física" },
  "3": { type: "Pessoa Singular", description: "Contribuinte pessoa física" },
  "45": { type: "Pessoa Singular não Residente", description: "Pessoa singular sem residência fiscal em Portugal" },
  "5": { type: "Pessoa Coletiva (NIPC)", description: "Empresa, associação ou fundação registada em Portugal" },
  "6": { type: "Administração Pública", description: "Organismo do Estado, autarquia local ou entidade pública" },
  "70": { type: "Herança Indivisa", description: "Herança não partilhada pelos herdeiros" },
  "71": { type: "Não Residente Coletivo", description: "Pessoa coletiva não residente em Portugal" },
  "72": { type: "Fundo de Investimento", description: "Fundo de investimento mobiliário ou imobiliário" },
  "74": { type: "Herança Indivisa não Residente", description: "Herança indivisa de não residente" },
  "75": { type: "Herança Indivisa", description: "Herança indivisa (regime especial)" },
  "77": { type: "Atribuição Oficiosa", description: "NIF atribuído oficiosamente pela AT (p.ex. fundos imobiliários)" },
  "78": { type: "Transferência de Créditos", description: "Entidade de securitização ou cessão de créditos" },
  "79": { type: "Entidade Excecional", description: "Entidade em regime excecional ou provisório" },
  "8": { type: "Empresário em Nome Individual", description: "Prefixo desativado desde 2001 — NIF histórico", deprecated: true },
  "90": { type: "Condomínio / Sociedade Irregular", description: "Condomínio ou sociedade sem personalidade jurídica" },
  "91": { type: "Condomínio / Sociedade Irregular", description: "Condomínio ou sociedade sem personalidade jurídica" },
  "98": { type: "Não Residente s/ Estab. Estável", description: "Pessoa coletiva não residente sem estabelecimento estável em Portugal" },
  "99": { type: "Sociedade Civil", description: "Sociedade civil sem personalidade jurídica" },
};

const PREFIXES: Array<{ key: string; display: string; type: string }> = [
  { key: "1", display: "1-3", type: "Pessoa Singular" },
  { key: "45", display: "45", type: "Pessoa Singular não Residente" },
  { key: "5", display: "5", type: "Pessoa Coletiva (NIPC)" },
  { key: "6", display: "6", type: "Administração Pública" },
  { key: "70", display: "70, 74, 75", type: "Herança Indivisa" },
  { key: "71", display: "71", type: "Não Residente Coletivo" },
  { key: "72", display: "72", type: "Fundo de Investimento" },
  { key: "77", display: "77", type: "Atribuição Oficiosa" },
  { key: "78", display: "78", type: "Transferência de Créditos" },
  { key: "79", display: "79", type: "Entidade Excecional" },
  { key: "8", display: "8", type: "Empresário em Nome Individual" },
  { key: "90", display: "90, 91", type: "Condomínio / Soc. Irregular" },
  { key: "98", display: "98", type: "Não Residente s/ Est. Estável" },
  { key: "99", display: "99", type: "Sociedade Civil" },
];

function resolveEntity(nif: string): EntityType | null {
  if (!nif) return null;
  const two = nif.slice(0, 2);
  const one = nif[0];
  if (nif.length >= 2 && ENTITY_MAP[two]) return ENTITY_MAP[two];
  if (["1", "2", "3", "5", "6", "8"].includes(one))
    return ENTITY_MAP[one] ?? null;
  return null;
}

function computeCheckDigit(nif: string): number {
  const sum = nif
    .slice(0, 8)
    .split("")
    .reduce((acc, d, i) => acc + +d * WEIGHTS[i], 0);
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
}

// Shared class strings kept as constants to avoid repetition in the loop
const CARD = "border-2 border-[var(--border)] rounded-xl px-5 py-[1.125rem]";
const CARD_LABEL =
  "text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text)] mb-[0.3rem]";
const OTP_INPUT =
  "box-border m-0 p-0 w-[2.625rem] h-12 border-2 border-[var(--border)] rounded-lg " +
  "bg-[var(--bg)] text-[var(--text-h)] font-mono text-xl font-semibold text-center " +
  "transition-[border-color,box-shadow] duration-150 " +
  "focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-bg)] " +
  "max-[480px]:w-[2.25rem] max-[480px]:h-11 max-[480px]:text-lg";

export default function App() {
  const [value, setValue] = useState("");

  const entity = resolveEntity(value);
  const isComplete = value.length === NIF_LENGTH;
  const expectedCheck = value.length >= 8 ? computeCheckDigit(value) : null;
  const checkDigitCorrect = isComplete
    ? computeCheckDigit(value) === +value[8]
    : null;
  const isValid = isComplete ? checkDigitCorrect && entity !== null : null;

  const calcRows =
    value.length >= 8
      ? value
          .slice(0, 8)
          .split("")
          .map((d, i) => ({
            pos: i + 1,
            digit: +d,
            weight: WEIGHTS[i],
            product: +d * WEIGHTS[i],
          }))
      : null;
  const calcSum = calcRows?.reduce((a, r) => a + r.product, 0) ?? null;
  const calcRemainder = calcSum !== null ? calcSum % 11 : null;
  const calcCheck =
    calcRemainder !== null
      ? calcRemainder < 2
        ? 0
        : 11 - calcRemainder
      : null;

  const showResult =
    entity !== null || (isComplete && entity === null) || value.length >= 8;

  // Border colour applied to every OTP input to reflect validity
  const otpStateBorder =
    isComplete && isValid
      ? "!border-green-600 dark:!border-green-400"
      : isComplete && isValid === false
        ? "!border-red-600 dark:!border-red-400"
        : "";

  // Table cell helpers
  const th = (left = false) =>
    `py-1 px-3 border-b border-[var(--border)] font-sans text-[0.72rem] uppercase tracking-[0.06em] font-bold ${left ? "text-left text-[var(--text)]" : "text-right text-[var(--text)]"}`;
  const td = (left = false) =>
    `py-1 px-3 border-b border-[var(--border)] font-mono ${left ? "text-left text-[var(--text)]" : "text-right text-[var(--text-h)]"}`;

  return (
    <main className="min-h-screen py-10 px-4 pb-16">
      <div className="max-w-[640px] mx-auto flex flex-col gap-10">
        {/* ── Header ── */}
        <header>
          <h1 className="text-[clamp(1.75rem,5vw,2.25rem)] font-extrabold text-[var(--text-h)] mb-[0.6rem] -tracking-[0.02em] m-0">
            Validador de NIF
          </h1>
          <p className="m-0 leading-[1.65]">
            O <strong>NIF</strong> (Número de Identificação Fiscal) é o número
            único de identificação de cada contribuinte em Portugal. Tem{" "}
            <strong>9 dígitos</strong> — os primeiros identificam o tipo de
            entidade e o último é um <strong>dígito de controlo</strong>{" "}
            calculado pelo algoritmo de módulo&nbsp;11.
          </p>
        </header>

        {/* ── OTP field ── */}
        <section>
          <label
            htmlFor="nif"
            className="block text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--text)] mb-3"
          >
            Número de Identificação Fiscal
          </label>
          <OTPField.Root
            id="nif"
            length={NIF_LENGTH}
            value={value}
            onValueChange={setValue}
            className="flex items-center gap-[0.4rem]"
          >
            <div className="flex gap-[0.375rem]">
              {Array.from({ length: 8 }, (_, i) => (
                <OTPField.Input
                  key={i}
                  className={`${OTP_INPUT} ${otpStateBorder}`}
                  aria-label={`Dígito ${i + 1} de ${NIF_LENGTH}`}
                />
              ))}
            </div>
            <OTPField.Separator className="w-5 h-[2px] bg-[var(--border)] shrink-0 rounded-sm" />
            <div className="flex gap-[0.375rem]">
              <OTPField.Input
                className={`${OTP_INPUT} bg-[var(--code-bg)] ${otpStateBorder}`}
                aria-label="Dígito de controlo"
              />
            </div>
          </OTPField.Root>
          <p className="mt-2 text-sm text-[var(--text)] min-h-[1.4em]">
            {value.length === 0 && "Introduza os 9 dígitos do NIF."}
            {value.length > 0 && value.length < 8 && "Continue a introduzir…"}
            {value.length === 8 && (
              <>
                Dígito de controlo esperado: <strong>{expectedCheck}</strong>.
              </>
            )}
            {isComplete && isValid && (
              <>
                Dígito de controlo <strong>{value[8]}</strong> correto.
              </>
            )}
            {isComplete && !isValid && (
              <>
                Dígito de controlo incorreto (esperado{" "}
                <strong>{expectedCheck}</strong>).
              </>
            )}
          </p>
        </section>

        {/* ── Result ── */}
        {showResult && (
          <section className="flex flex-col gap-[0.875rem]">
            {/* Entity type */}
            {entity ? (
              <div className={CARD}>
                <div className={CARD_LABEL}>Tipo de Entidade</div>
                <div className="text-[1.15rem] font-bold text-[var(--text-h)] mb-[0.2rem]">
                  {entity.type}
                </div>
                <div className="text-sm text-[var(--text)] leading-[1.5]">
                  {entity.description}
                </div>
                {entity.deprecated && (
                  <div className="mt-[0.625rem] text-[0.8rem] text-amber-700 dark:text-amber-400 bg-amber-700/8 dark:bg-amber-400/8 rounded-md px-[0.65rem] py-[0.35rem]">
                    Prefixo desativado — não é emitido desde 2001.
                  </div>
                )}
              </div>
            ) : isComplete ? (
              <div className={CARD}>
                <div className={CARD_LABEL}>Tipo de Entidade</div>
                <div className="text-[1.15rem] font-bold text-[var(--text-h)] mb-[0.2rem]">
                  Prefixo desconhecido
                </div>
                <div className="text-sm text-[var(--text)] leading-[1.5]">
                  O prefixo <strong>{value.slice(0, 2)}</strong> não corresponde
                  a nenhuma entidade fiscal reconhecida pela AT.
                </div>
              </div>
            ) : null}

            {/* Validity */}
            {isComplete && (
              <div
                className={`${CARD} ${
                  isValid
                    ? "border-green-600 dark:border-green-400 bg-green-600/5 dark:bg-green-400/7"
                    : "border-red-600 dark:border-red-400 bg-red-600/5 dark:bg-red-400/7"
                }`}
              >
                <div className="flex items-center gap-2 mb-[0.3rem]">
                  <span
                    className={`text-base font-extrabold leading-none ${isValid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    aria-hidden="true"
                  >
                    {isValid ? "✓" : "✗"}
                  </span>
                  <strong>{isValid ? "NIF Válido" : "NIF Inválido"}</strong>
                </div>
                <p className="m-0 text-[0.9rem]">
                  {isValid ? (
                    <>
                      O dígito de controlo <strong>{value[8]}</strong> está
                      correto.
                    </>
                  ) : entity === null ? (
                    <>Prefixo não reconhecido.</>
                  ) : (
                    <>
                      Dígito de controlo incorreto — esperado{" "}
                      <strong>{expectedCheck}</strong>, recebido{" "}
                      <strong>{value[8]}</strong>.
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Algorithm breakdown */}
            {calcRows && (
              <details className={`group ${CARD}`}>
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden text-sm font-semibold text-[var(--text-h)] flex items-center gap-2 select-none">
                  <span className="text-[0.6rem] text-[var(--text)] transition-transform duration-200 group-open:rotate-90">
                    ▶
                  </span>
                  Como é calculado o dígito de controlo?
                </summary>
                <div className="mt-4 text-sm">
                  <p className="mb-3 text-[var(--text)]">
                    Multiplicam-se os primeiros 8 dígitos pelos pesos 9, 8, 7,
                    6, 5, 4, 3, 2 e somam-se os produtos:
                  </p>
                  <table className="w-full border-collapse font-mono text-sm mb-4">
                    <thead>
                      <tr>
                        <th className={th(true)}>Pos.</th>
                        <th className={th()}>Dígito</th>
                        <th className={th()}>Peso</th>
                        <th className={th()}>Produto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calcRows.map((r) => (
                        <tr key={r.pos}>
                          <td className={td(true)}>{r.pos}</td>
                          <td className={td()}>{r.digit}</td>
                          <td className={td()}>{r.weight}</td>
                          <td className={td()}>{r.product}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan={3}
                          className="py-1 px-3 text-left border-t-2 border-t-[var(--border)] font-sans"
                        >
                          <strong>Soma</strong>
                        </td>
                        <td className="py-1 px-3 text-right border-t-2 border-t-[var(--border)] font-mono text-[var(--text-h)]">
                          <strong>{calcSum}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  <ol className="m-0 pl-[1.4rem] flex flex-col gap-[0.4rem] text-sm text-[var(--text)]">
                    <li>
                      {calcSum} mod 11 ={" "}
                      <strong className="text-[var(--text-h)]">
                        {calcRemainder}
                      </strong>
                    </li>
                    <li>
                      {calcRemainder! < 2 ? (
                        <>
                          Resto &lt; 2 → dígito de controlo ={" "}
                          <strong className="text-[var(--text-h)]">0</strong>
                        </>
                      ) : (
                        <>
                          11 − {calcRemainder} ={" "}
                          <strong className="text-[var(--text-h)]">
                            {calcCheck}
                          </strong>
                        </>
                      )}
                    </li>
                  </ol>
                </div>
              </details>
            )}
          </section>
        )}

        {/* ── Prefix reference ── */}
        <section>
          <h2 className="text-lg font-bold text-[var(--text-h)] m-0 mb-[0.35rem]">
            Prefixos do NIF
          </h2>
          <p className="m-0 mb-4 text-sm text-[var(--text)]">
            O 1.º ou os 2 primeiros dígitos determinam o tipo de entidade
            contribuinte.
          </p>
          <div
            className="grid gap-[0.4rem]"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {PREFIXES.map(({ key, display, type }) => (
              <div
                key={key}
                className="flex items-center gap-[0.625rem] py-[0.45rem] px-3 border border-[var(--border)] rounded-lg text-[0.8rem]"
              >
                <code className="bg-[var(--code-bg)] text-[var(--accent)] font-mono text-[0.8rem] font-bold py-[0.1rem] px-[0.45rem] rounded shrink-0 whitespace-nowrap">
                  {display}
                </code>
                <span className="text-[var(--text)] leading-[1.3]">{type}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
