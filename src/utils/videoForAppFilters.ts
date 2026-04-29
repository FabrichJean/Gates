export type VideoForAppDurationError =
  | "duration_min_format"
  | "duration_max_format"
  | "duration_range";

export function normalizeDurationHhMmSsInput(value: string) {
  const sanitized = value.replace(/[^\d:]/g, "");

  if (!sanitized) {
    return "";
  }

  if (sanitized.includes(":")) {
    const [hoursPart = "", minutesPart = "", secondsPart = ""] = sanitized.split(":").slice(0, 3);
    const hours = hoursPart.replace(/\D/g, "").slice(0, 4);
    const minutes = minutesPart.replace(/\D/g, "").slice(0, 2);
    const seconds = secondsPart.replace(/\D/g, "").slice(0, 2);

    if (!hours && !minutes && !seconds) {
      return "";
    }

    const partCount = sanitized.split(":").length;

    if (partCount === 2) {
      if (sanitized.endsWith(":") && !minutes) {
        return `${hours}:`;
      }

      return `${hours}:${minutes}`;
    }

    if (sanitized.endsWith(":") && !seconds) {
      return `${hours}:${minutes}:`;
    }

    return `${hours}:${minutes}:${seconds}`;
  }

  const digits = sanitized.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, -2)}:${digits.slice(-2)}`;
  }

  return `${digits.slice(0, -4)}:${digits.slice(-4, -2)}:${digits.slice(-2)}`;
}

export function parseDurationHhMmSsToMilliseconds(value?: string | null) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return undefined;
  }

  if (/^\d+$/.test(normalizedValue)) {
    const digits = normalizedValue.slice(0, 8);

    if (digits.length <= 2) {
      return Number(digits) * 1000;
    }

    if (digits.length <= 4) {
      const minutes = Number(digits.slice(0, -2));
      const seconds = Number(digits.slice(-2));

      if (Number.isNaN(minutes) || Number.isNaN(seconds) || seconds > 59) {
        return null;
      }

      return (minutes * 60 + seconds) * 1000;
    }

    const hours = Number(digits.slice(0, -4));
    const minutes = Number(digits.slice(-4, -2));
    const seconds = Number(digits.slice(-2));

    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds) || minutes > 59 || seconds > 59) {
      return null;
    }

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  const hhMmSsMatch = normalizedValue.match(/^(\d{1,4}):(\d{0,2}):(\d{0,2})$/);

  if (hhMmSsMatch) {
    const hours = Number(hhMmSsMatch[1] || "0");
    const minutes = Number(hhMmSsMatch[2] || "0");
    const seconds = Number(hhMmSsMatch[3] || "0");

    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds) || minutes > 59 || seconds > 59) {
      return null;
    }

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  const mmSsMatch = normalizedValue.match(/^(\d{1,4}):(\d{0,2})$/);

  if (!mmSsMatch) {
    return null;
  }

  const minutes = Number(mmSsMatch[1] || "0");
  const seconds = Number(mmSsMatch[2] || "0");

  if (Number.isNaN(minutes) || Number.isNaN(seconds) || seconds > 59) {
    return null;
  }

  return (minutes * 60 + seconds) * 1000;
}

export function formatDurationMillisecondsToHhMmSs(value: number) {
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function finalizeDurationHhMmSsInput(value: string) {
  const normalizedValue = normalizeDurationHhMmSsInput(value);

  if (!normalizedValue) {
    return "";
  }

  const milliseconds = parseDurationHhMmSsToMilliseconds(normalizedValue);

  if (milliseconds === null || milliseconds === undefined) {
    return normalizedValue;
  }

  return formatDurationMillisecondsToHhMmSs(milliseconds);
}

type BuildVideoForAppListParamsOptions = {
  filters?: Record<string, any>;
  baseParams?: Record<string, any>;
  page?: number | string;
  strictDuration?: boolean;
};

export function buildVideoForAppListParams({
  filters = {},
  baseParams = {},
  page,
  strictDuration = false,
}: BuildVideoForAppListParamsOptions): {
  params: Record<string, any>;
  error?: VideoForAppDurationError;
} {
  let isDeletedValue: boolean | undefined;
  let accessingValue: boolean | undefined;

  if (filters.isDeleted === "yes") {
    isDeletedValue = true;
  } else if (filters.isDeleted === "no") {
    isDeletedValue = false;
  } else {
    isDeletedValue = undefined;
  }

  if (filters.accessing === "yes") {
    accessingValue = true;
  } else if (filters.accessing === "no") {
    accessingValue = false;
  } else {
    accessingValue = undefined;
  }

  let checkingValue: string | undefined;

  if (filters.checking === "all" || filters.checking === "" || !filters.checking) {
    checkingValue = undefined;
  } else {
    checkingValue = filters.checking;
  }

  const hasDurationMin = typeof filters.durationMin === "string" && filters.durationMin.trim() !== "";
  const hasDurationMax = typeof filters.durationMax === "string" && filters.durationMax.trim() !== "";
  const durationMinValue = parseDurationHhMmSsToMilliseconds(filters.durationMin);
  const durationMaxValue = parseDurationHhMmSsToMilliseconds(filters.durationMax);

  if (strictDuration && hasDurationMin && durationMinValue === null) {
    return { params: {}, error: "duration_min_format" };
  }

  if (strictDuration && hasDurationMax && durationMaxValue === null) {
    return { params: {}, error: "duration_max_format" };
  }

  if (
    durationMinValue !== undefined &&
    durationMinValue !== null &&
    durationMaxValue !== undefined &&
    durationMaxValue !== null &&
    durationMinValue > durationMaxValue
  ) {
    if (strictDuration) {
      return { params: {}, error: "duration_range" };
    }

    return {
      params: {
        ...baseParams,
        creator_id: filters.creator_id || undefined,
        category_id: filters.category_id || undefined,
        subcategory_id: filters.subcategory_id || undefined,
        tag: filters.tagSearch || filters.tag || undefined,
        isDeleted: isDeletedValue,
        accessing: accessingValue,
        checking: checkingValue,
        type: filters.type ? parseInt(filters.type, 10) : undefined,
        category: filters.categorySearch || undefined,
        subcategory: filters.subcategorySearch || undefined,
        ...(page !== undefined ? { page } : {}),
      },
    };
  }

  const params: Record<string, any> = {
    ...baseParams,
    creator_id: filters.creator_id || undefined,
    category_id: filters.category_id || undefined,
    subcategory_id: filters.subcategory_id || undefined,
    tag: filters.tagSearch || filters.tag || undefined,
    isDeleted: isDeletedValue,
    accessing: accessingValue,
    checking: checkingValue,
    type: filters.type ? parseInt(filters.type, 10) : undefined,
    category: filters.categorySearch || undefined,
    subcategory: filters.subcategorySearch || undefined,
  };

  if (page !== undefined) {
    params.page = page;
  }

  if (durationMinValue !== undefined && durationMinValue !== null) {
    params.seconde_min = Math.floor(durationMinValue / 1000);
  }

  if (durationMaxValue !== undefined && durationMaxValue !== null) {
    params.seconde_max = Math.floor(durationMaxValue / 1000);
  }

  return { params };
}
