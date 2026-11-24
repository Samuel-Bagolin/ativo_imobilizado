"use client";

import { useEffect, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { CasaOracao, Item } from "@/lib/types";

type Resumo = {
  casa: CasaOracao;
  totalItens: number;
  itensAtivos: number;
  valorAtualTotal: number;
};

// Estilo gratuito (sem necessidade de API key), em tons de cinza/prata — combina com a
// identidade visual sóbria em cinza da Congregação Cristã no Brasil.
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function Predio3D({ temEstoque, destaque }: { temEstoque: boolean; destaque: boolean }) {
  // Marcador em estilo "prédio 3D" na identidade cinza da CCB: estrutura em tons de
  // cinza/prata, com a base acesa em verde (há estoque) ou vermelho (sem estoque).
  const corStatus = temEstoque ? "#16a34a" : "#dc2626";
  return (
    <div
      style={{
        width: 26,
        height: destaque ? 48 : 36,
        position: "relative",
        cursor: "pointer",
        filter: destaque ? "drop-shadow(0 6px 6px rgba(0,0,0,0.4))" : "drop-shadow(0 3px 3px rgba(0,0,0,0.3))",
        transition: "height 0.15s ease",
      }}
    >
      {/* Corpo do prédio — cinza CCB */}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: 0,
          width: 18,
          height: "calc(100% - 6px)",
          background: "#6b7280",
          borderRadius: "3px 3px 0 0",
          transform: "perspective(60px) rotateY(10deg)",
          transformOrigin: "bottom left",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: 14,
          width: 10,
          height: "calc(90% - 6px)",
          background: "#52525b",
          borderRadius: "0 3px 0 0",
          transform: "perspective(60px) rotateY(-25deg)",
          transformOrigin: "bottom left",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -2,
          left: 0,
          width: 24,
          height: 8,
          background: "#9ca3af",
          clipPath: "polygon(0 50%, 70% 0, 100% 50%, 30% 100%)",
        }}
      />
      {/* Base acesa: verde = tem estoque, vermelho = vazia */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 24,
          height: 6,
          background: corStatus,
          borderRadius: "0 0 3px 3px",
          boxShadow: `0 0 6px ${corStatus}`,
        }}
      />
    </div>
  );
}

function statusBadge(status: Item["status"]) {
  if (status === "Ativo") return <span className="badge badge-green">Ativo</span>;
  if (status === "Depreciado") return <span className="badge badge-amber">Depreciado</span>;
  return <span className="badge badge-slate">Baixado</span>;
}

export default function MapaClient({ resumo }: { resumo: Resumo[] }) {
  const [selecionado, setSelecionado] = useState<Resumo | null>(null);
  const [itensCasa, setItensCasa] = useState<Item[] | null>(null);
  const [carregando, setCarregando] = useState(false);

  const lats = resumo.map((r) => r.casa.latitude);
  const lngs = resumo.map((r) => r.casa.longitude);
  const centerLat = lats.reduce((a, b) => a + b, 0) / (lats.length || 1);
  const centerLng = lngs.reduce((a, b) => a + b, 0) / (lngs.length || 1);

  useEffect(() => {
    if (!selecionado) {
      setItensCasa(null);
      return;
    }
    let cancelado = false;
    setCarregando(true);
    fetch(`/api/itens?casaOracaoId=${selecionado.casa.id}`)
      .then((res) => res.json())
      .then((data: Item[]) => {
        if (!cancelado) setItensCasa(data);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [selecionado]);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-4">
      <div className="card p-0 overflow-hidden" style={{ height: 560 }}>
        <Map
          initialViewState={{
            latitude: centerLat || -25.53,
            longitude: centerLng || -49.2,
            zoom: 11.5,
            pitch: 55,
            bearing: -17,
          }}
          mapStyle={MAP_STYLE}
          style={{ width: "100%", height: "100%" }}
          onClick={() => setSelecionado(null)}
        >
          <NavigationControl position="top-right" visualizePitch />
          {resumo.map((r) => {
            const temEstoque = r.itensAtivos > 0;
            return (
              <Marker
                key={r.casa.id}
                latitude={r.casa.latitude}
                longitude={r.casa.longitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelecionado(r);
                }}
              >
                <Predio3D temEstoque={temEstoque} destaque={selecionado?.casa.id === r.casa.id} />
              </Marker>
            );
          })}
        </Map>
      </div>

      <div className="card flex flex-col gap-3" style={{ height: 560 }}>
        {!selecionado ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400 gap-2">
            <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold">
              ?
            </div>
            <p className="text-sm">Clique em uma casa de oração no mapa para ver todos os itens disponíveis.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
              <div>
                <p className="font-bold text-zinc-800">{selecionado.casa.nome}</p>
                <p className="text-xs text-zinc-500">{selecionado.casa.codigo}</p>
              </div>
              {selecionado.itensAtivos > 0 ? (
                <span className="badge badge-green">Com estoque</span>
              ) : (
                <span className="badge badge-red">Sem estoque</span>
              )}
            </div>
            <div className="flex gap-4 text-xs text-zinc-600">
              <span>
                <strong className="text-zinc-800">{selecionado.totalItens}</strong> itens no total
              </span>
              <span>
                <strong className="text-zinc-800">
                  {selecionado.valorAtualTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </strong>{" "}
                em valor atual
              </span>
            </div>

            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              {carregando && <p className="text-sm text-zinc-400 py-4 text-center">Carregando itens...</p>}
              {!carregando && itensCasa && itensCasa.length === 0 && (
                <p className="text-sm text-zinc-400 py-4 text-center">Nenhum item lançado nesta casa ainda.</p>
              )}
              {!carregando && itensCasa && itensCasa.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {itensCasa.map((item) => (
                    <li key={item.id} className="border border-zinc-200 rounded-md p-2 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-zinc-800">{item.descricao}</span>
                        {statusBadge(item.status)}
                      </div>
                      <p className="text-xs text-zinc-500 font-mono">{item.codigo || "sem código"}</p>
                      <p className="text-xs text-zinc-500">{item.dependencia}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Vl. atual: {item.vlAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
