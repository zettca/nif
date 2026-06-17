import { useState } from "react";
import { OTPFieldPreview as OTPField } from "@base-ui/react/otp-field";
import { Card } from "./Card";

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

const OTP_INPUT =
  "w-10 h-12 border-2 border-border rounded-lg text-heading font-mono text-xl font-semibold text-center ";

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
      ? "!border-success"
      : isComplete && isValid === false
        ? "!border-error"
        : "";

  return (
    <main className="min-h-screen max-w-lg py-12 px-4 mx-auto flex flex-col gap-10">
      {/* ── Header ── */}
      <header>
        <h1 className="text-4xl font-extrabold text-heading mb-2.5 tracking-tight m-0">
          Validador de NIF
        </h1>
        <p className="m-0">
          O <strong>NIF</strong> (Número de Identificação Fiscal) é o número
          único de identificação de cada contribuinte em Portugal. Tem{" "}
          <strong>9 dígitos</strong> — os primeiros identificam o tipo de
          entidade e o último é um <strong>dígito de controlo</strong> calculado
          pelo algoritmo de módulo 11.
        </p>
      </header>

      {/* ── OTP field ── */}
      <section>
        <label
          htmlFor="nif"
          className="block text-xs font-bold uppercase tracking-widest mb-3"
        >
          Número de Identificação Fiscal
        </label>
        <OTPField.Root
          id="nif"
          length={NIF_LENGTH}
          value={value}
          onValueChange={setValue}
          className="flex items-center gap-2"
        >
          <div className="flex gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <OTPField.Input
                key={i}
                className={`${OTP_INPUT} ${otpStateBorder}`}
                aria-label={`Dígito ${i + 1} de ${NIF_LENGTH}`}
              />
            ))}
          </div>
          <OTPField.Separator className="w-5 h-2px bg-border shrink-0 rounded-sm" />
          <div className="flex gap-2">
            <OTPField.Input
              className={`${OTP_INPUT} bg-code ${otpStateBorder}`}
              aria-label="Dígito de controlo"
            />
          </div>
        </OTPField.Root>
        <p className="mt-2 text-sm min-h-2">
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
        <section className="grid gap-4">
          {/* Entity type */}
          {entity ? (
            <Card label="Tipo de Entidade">
              <div className="text-lg font-bold text-heading mb-1">
                {entity.type}
              </div>
              <div className="text-sm leading-normal">{entity.description}</div>
              {entity.deprecated && (
                <div className="mt-2.5 text-xs text-warning bg-warning/10 rounded-md px-2.5 py-1.5">
                  Prefixo desativado — não é emitido desde 2001.
                </div>
              )}
              <details className="group mt-4">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden text-sm font-semibold text-heading flex items-center gap-2 select-none">
                  <span className="text-lg transition-transform duration-200 group-open:rotate-90">
                    ▶
                  </span>
                  Prefixos do NIF
                </summary>
                <div className="mt-4">
                  <p className="m-0 mb-4 text-sm">
                    O 1.º ou os 2 primeiros dígitos determinam o tipo de
                    entidade contribuinte.
                  </p>
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                    }}
                  >
                    {PREFIXES.map(({ key, display, type }) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 py-2 px-3 border border-border rounded-lg text-xs"
                      >
                        <code className="bg-code text-accent font-mono text-xs font-bold py-0.5 px-2 rounded shrink-0 whitespace-nowrap">
                          {display}
                        </code>
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </Card>
          ) : isComplete ? (
            <Card label="Tipo de Entidade" status="error">
              <div className="text-lg font-bold text-heading mb-1">
                Prefixo desconhecido
              </div>
              <div className="text-sm leading-normal">
                O prefixo <strong>{value.slice(0, 2)}</strong> não corresponde a
                nenhuma entidade fiscal reconhecida pela AT.
              </div>
              <details className="group mt-4">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden text-sm font-semibold text-heading flex items-center gap-2 select-none">
                  <span className="text-lg transition-transform duration-200 group-open:rotate-90">
                    ▶
                  </span>
                  Prefixos do NIF
                </summary>
                <div className="mt-4">
                  <p className="m-0 mb-4 text-sm">
                    O 1.º ou os 2 primeiros dígitos determinam o tipo de
                    entidade contribuinte.
                  </p>
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                    }}
                  >
                    {PREFIXES.map(({ key, display, type }) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 py-2 px-3 border border-border rounded-lg text-xs"
                      >
                        <code className="bg-code text-accent font-mono text-xs font-bold py-0.5 px-2 rounded shrink-0 whitespace-nowrap">
                          {display}
                        </code>
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </Card>
          ) : null}

          {/* Validity */}
          {isComplete && (
            <Card status={isValid ? "success" : "error"}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-base font-extrabold leading-none ${
                    isValid ? "text-success" : "text-error"
                  }`}
                  aria-hidden="true"
                >
                  {isValid ? "✓" : "✗"}
                </span>
                <strong>{isValid ? "NIF Válido" : "NIF Inválido"}</strong>
              </div>
              <p className="m-0 text-sm">
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
              {calcRows && (
                <details className="group mt-4">
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden text-sm font-semibold text-heading flex items-center gap-2 select-none">
                    <span className="text-lg transition-transform duration-200 group-open:rotate-90">
                      ▶
                    </span>
                    Como é calculado o dígito de controlo?
                  </summary>
                  <div className="mt-4 text-sm">
                    <div className="bg-code p-3 rounded font-mono text-sm flex flex-col gap-1">
                      <div>
                        ⇒{" "}
                        {calcRows
                          .map((r) => `${r.digit}*${r.weight}`)
                          .join(" + ")}{" "}
                        = <b>{calcSum}</b>
                      </div>
                      <div>
                        ⇒ {calcSum} mod 11 = <b>{calcRemainder}</b>
                      </div>
                      <div>
                        ⇒ 11 - 6 = <b>{calcCheck}</b>
                      </div>
                    </div>
                  </div>
                </details>
              )}
            </Card>
          )}
        </section>
      )}
    </main>
  );
}
