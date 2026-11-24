"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { CasaOracao } from "@/lib/types";

type Resumo = {
  casa: CasaOracao;
  totalItens: number;
  itensAtivos: number;
  valorAtualTotal: number;
};

// Estilo gratuito (sem necessidade de API key) baseado em vetores CARTO
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function Predio3D({ cor, destaque }: { cor: string; destaque: boolean }) {
  // Marcador em estilo "prédio 3D": base + corpo extrudido com sombra lateral,
  // simulando perspectiva isométrica sem depender de camada de edifícios 3D de terceiros.
  return (
    <div
      style={{
        width: 26,
        height: destaque ? 46 : 34,
        position: "relative",
        cursor: "pointer",
        filter: destaque ? "drop-shadow(0 6px 6px rgba(0,0,0,0.35))" : "drop-shadow(0 3px 3px rgba(0,0,0,0.25))",
        transition: "height 0.15s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 18,
          height: "100%",
          background: cor,
          borderRadius: "3px 3px 0 0",
          transform: "perspective(60px) rotateY(10deg)",
          transformOrigin: "bottom left",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 14,
          width: 10,
          height: "90%",
          background: cor,
          filter: "brightness(0.7)",
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
          background: cor,
          filter: "brightness(1.2)",
          clipPath: "polygon(0 50%, 70% 0, 100% 50%, 30% 100%)",
        }}
      />
    </div>
  );
}

export default function MapaClient({ resumo }: { resumo: Resumo[] }) {
  const [selecionado, setSelecionado] = useState<Resumo | null>(null);

  const lats = resumo.map((r) => r.casa.latitude);
  const lngs = resumo.map((r) => r.casa.longitude);
  const centerLat = lats.reduce((a, b) => a + b, 0) / (lats.length || 1);
  const centerLng = lngs.reduce((a, b) => a + b, 0) / (lngs.length || 1);

  return (
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
              <Predio3D cor={temEstoque ? "#16a34a" : "#dc2626"} destaque={selecionado?.casa.id === r.casa.id} />
            </Marker>
          );
        })}

        {selecionado && (
          <Popup
            latitude={selecionado.casa.latitude}
            longitude={selecionado.casa.longitude}
            anchor="top"
            onClose={() => setSelecionado(null)}
            closeOnClick={false}
          >
            <div className="text-sm">
              <p className="font-bold">{selecionado.casa.nome}</p>
              <p className="text-xs text-slate-500">{selecionado.casa.codigo}</p>
              <p className="mt-1">
                {selecionado.itensAtivos > 0 ? (
                  <span className="badge badge-green">
                    {selecionado.itensAtivos} item(ns) ativo(s)
                  </span>
                ) : (
                  <span className="badge badge-red">Sem estoque</span>
                )}
              </p>
              <p className="mt-1 text-xs">
                Total de itens: {selecionado.totalItens} · Valor atual:{" "}
                {selecionado.valorAtualTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
