export interface GeoRefProvincia {
  id: string;
  nombre: string;
}

export interface GeoRefLocalidad {
  id: string;
  nombre: string;
  municipio?: { id: string; nombre: string } | null;
}

// Memory caching to prevent redundant requests
let cacheProvincias: GeoRefProvincia[] | null = null;
const cacheLocalidades = new Map<string, GeoRefLocalidad[]>();
const cacheCP = new Map<string, string | null>();

// Dictionary of postal codes for common Argentine cities & localities
const KNOWN_POSTAL_CODES: Record<string, string> = {
  "trelew": "9100",
  "rawson": "9103",
  "puerto madryn": "9120",
  "gaiman": "9105",
  "dolavon": "9107",
  "esquel": "9200",
  "trevelin": "9203",
  "comodoro rivadavia": "9000",
  "rada tilly": "9001",
  "el hoyo": "9211",
  "lago puelo": "9211",
  "el maiten": "9213",
  "ciudad autonoma de buenos aires": "1000",
  "caba": "1000",
  "cordoba": "5000",
  "rosario": "2000",
  "mendoza": "5500",
  "san miguel de tucuman": "4000",
  "la plata": "1900",
  "mar del plata": "7600",
  "salta": "4400",
  "santa fe": "3000",
  "neuquen": "8300",
  "san carlos de bariloche": "8400",
  "bahia blanca": "8000",
  "resistencia": "3500",
  "posadas": "3300",
  "san salvador de jujuy": "4600",
  "parana": "3100",
  "formosa": "3600",
  "san fernando del valle de catamarca": "4700",
  "san luis": "5700",
  "la rioja": "5300",
  "rio gallegos": "9400",
  "ushuaia": "9410",
};

export class GeoRefService {
  private static BASE_URL = 'https://apis.datos.gob.ar/georef/api';

  /**
   * Obtiene todas las provincias de Argentina ordenadas alfabéticamente.
   */
  static async getProvincias(): Promise<GeoRefProvincia[]> {
    if (cacheProvincias && cacheProvincias.length > 0) {
      return cacheProvincias;
    }

    try {
      const res = await fetch(`${this.BASE_URL}/provincias?campos=id,nombre&max=100`);
      if (!res.ok) throw new Error('Error HTTP al conectar con la API de GeoRef');

      const data = await res.json();
      const provs: GeoRefProvincia[] = (data.provincias || [])
        .map((p: any) => ({ id: p.id, nombre: p.nombre }))
        .sort((a: GeoRefProvincia, b: GeoRefProvincia) => a.nombre.localeCompare(b.nombre));

      cacheProvincias = provs;
      return provs;
    } catch (error) {
      console.error('GeoRefService.getProvincias error:', error);
      throw new Error('No se pudieron obtener las provincias desde la API oficial de GeoRef.');
    }
  }

  /**
   * Obtiene las localidades asociadas a una provincia.
   */
  static async getLocalidades(provinciaNombre: string): Promise<GeoRefLocalidad[]> {
    if (!provinciaNombre || !provinciaNombre.trim()) return [];

    const cacheKey = provinciaNombre.trim().toLowerCase();
    if (cacheLocalidades.has(cacheKey)) {
      return cacheLocalidades.get(cacheKey)!;
    }

    try {
      const param = encodeURIComponent(provinciaNombre.trim());
      const res = await fetch(`${this.BASE_URL}/localidades?provincia=${param}&campos=id,nombre,municipio&max=1000`);
      if (!res.ok) throw new Error('Error HTTP al consultar localidades');

      const data = await res.json();
      const rawList: any[] = data.localidades || [];

      // Deduplicar por nombre y ordenar
      const uniqueMap = new Map<string, GeoRefLocalidad>();
      rawList.forEach((loc) => {
        if (loc.nombre && !uniqueMap.has(loc.nombre)) {
          uniqueMap.set(loc.nombre, {
            id: loc.id,
            nombre: loc.nombre,
            municipio: loc.municipio,
          });
        }
      });

      const list = Array.from(uniqueMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
      cacheLocalidades.set(cacheKey, list);
      return list;
    } catch (error) {
      console.error('GeoRefService.getLocalidades error:', error);
      throw new Error('No se pudieron cargar las localidades de la provincia seleccionada.');
    }
  }

  /**
   * Obtiene o autocompleta el Código Postal correspondiente a la localidad.
   * Retorna el string del CP si está disponible, o null si se debe permitir ingreso manual.
   */
  static async getCodigoPostal(provincia: string, localidad: string): Promise<string | null> {
    if (!provincia || !localidad) return null;

    const cacheKey = `${provincia.trim().toLowerCase()}-${localidad.trim().toLowerCase()}`;
    if (cacheCP.has(cacheKey)) {
      return cacheCP.get(cacheKey)!;
    }

    const locClean = localidad
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // 1. Direct match in dictionary
    if (KNOWN_POSTAL_CODES[locClean]) {
      const cp = KNOWN_POSTAL_CODES[locClean];
      cacheCP.set(cacheKey, cp);
      return cp;
    }

    // 2. Substring match
    for (const [key, cp] of Object.entries(KNOWN_POSTAL_CODES)) {
      if (locClean.includes(key) || key.includes(locClean)) {
        cacheCP.set(cacheKey, cp);
        return cp;
      }
    }

    // 3. Fallback: null if unavailable (prompt specifies allowing manual entry in this case)
    cacheCP.set(cacheKey, null);
    return null;
  }
}
