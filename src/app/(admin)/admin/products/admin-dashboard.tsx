import { useRef, useState, type FormEvent } from "react";
import { createAdminProduct } from "@/features/admin/api";
import type { AdminProductInput } from "@/features/admin/api";

type View = "register" | "list" | "edit";
type DialogType = "delete-all" | "delete-selected" | null;
type CategoryValue = "" | "housing" | "pcb" | "switches" | "keycaps";
type IconName =
  | "box"
  | "plus"
  | "list"
  | "search"
  | "filter"
  | "upload"
  | "image"
  | "trash"
  | "chevron"
  | "bell"
  | "user"
  | "check"
  | "close"
  | "alert"
  | "menu";

const categories: { label: string; value: Exclude<CategoryValue, ""> }[] = [
  { label: "하우징", value: "housing" },
  { label: "기판", value: "pcb" },
  { label: "스위치", value: "switches" },
  { label: "키캡", value: "keycaps" },
];

const inputClass =
  "h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-800 focus:ring-3 focus:ring-zinc-800/10";

function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    box: (
      <>
        <path d="m3.5 7 8.5 4.8L20.5 7" />
        <path d="M12 21.5V11.8M20.5 16.7V7L12 2.5 3.5 7v9.7L12 21.5l8.5-4.8Z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    list: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m4 17 5-5 4 4 2-2 5 5" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M6.5 7l1 14h9l1-14M10 11v6M14 11v6" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    alert: (
      <>
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.8 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {paths[name]}
    </svg>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-zinc-700">
        {label}
        {required && <span className="text-zinc-900">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex gap-3 border-b border-zinc-100 px-6 py-5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-900">
          {number}
        </span>
        <div>
          <h2 className="text-base font-bold tracking-[-0.01em] text-zinc-900">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-400">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function ProductForm({
  mode,
  onCancel,
  onComplete,
}: {
  mode: "register" | "edit";
  onCancel: () => void;
  onComplete: (message: string) => void;
}) {
  const [images, setImages] = useState<
    { name: string; url: string; file: File }[]
  >([]);
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [spec, setSpec] = useState({
    layout: null as string | null,
    housingMaterial: null as string | null,
    supportPins: null as string | null,
    isWireless: null as boolean | null,
    switchPin: null as string | null,
    switchType: null as string | null,
    keycapMaterial: null as string | null,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImages = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !/\.(jpe?g|png|webp)$/i.test(file.name)
    ) {
      setError("JPG, JPEG, PNG, WEBP 이미지 파일만 선택할 수 있습니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지 용량은 5MB 이하만 업로드할 수 있습니다.");
      return;
    }
    setError("");
    setImages((current) => {
      current.forEach((image) => URL.revokeObjectURL(image.url));
      return [{ name: file.name, url: URL.createObjectURL(file), file }];
    });
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      URL.revokeObjectURL(current[index].url);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const formatNumber = (value: string) =>
    value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "edit") {
      setError("상품 수정 API는 아직 연결되지 않았습니다.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const categoryValue = String(formData.get("categoryName") ?? "");
    const categoryName = categories.find(
      (category) => category.value === categoryValue,
    )?.label;
    const name = String(formData.get("name") ?? "").trim();
    const basePrice = Number(
      String(formData.get("basePrice") ?? "").replaceAll(",", ""),
    );
    const stockQuantity = Number(formData.get("stockQuantity"));
    const description =
      String(formData.get("description") ?? "").trim() || null;

    if (
      !categoryName ||
      !name ||
      !Number.isInteger(basePrice) ||
      basePrice <= 0 ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError("상품명, 카테고리, 가격, 재고를 확인해 주세요.");
      return;
    }

    const input: AdminProductInput = {
      categoryName,
      name,
      basePrice,
      stockQuantity,
      thumbnailUrl: null,
      description,
      layout: spec.layout,
      housingMaterial: spec.housingMaterial,
      supportPins: spec.supportPins,
      isWireless: spec.isWireless,
      switchPin: spec.switchPin ? Number(spec.switchPin) : null,
      switchType: spec.switchType,
      keycapMaterial: spec.keycapMaterial,
    };

    setError("");
    setSubmitting(true);
    try {
      const productId = await createAdminProduct(input, images[0]?.file);
      onComplete(`상품이 정상적으로 등록되었습니다. 상품 번호: ${productId}`);
      form.reset();
      setPrice("");
      setSelectedCategory("");
      setSpec({
        layout: null,
        housingMaterial: null,
        supportPins: null,
        isWireless: null,
        switchPin: null,
        switchType: null,
        keycapMaterial: null,
      });
      images.forEach((image) => URL.revokeObjectURL(image.url));
      setImages([]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "상품을 등록할 수 없습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <FormSection
        number="01"
        title="기본 정보"
        description="상품의 기본 정보를 입력해주세요"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="상품명" required>
              <input
                className={inputClass}
                name="name"
                placeholder="상품명을 입력해 주세요"
                required
              />
            </Field>
          </div>
          <Field label="상품 카테고리" required>
            <div className="relative">
              <select
                className={`${inputClass} appearance-none pr-10`}
                value={selectedCategory}
                name="categoryName"
                onChange={(event) => {
                  const nextCategory = event.target.value as CategoryValue;
                  setSelectedCategory(nextCategory);
                  setSpec({
                    layout: null,
                    housingMaterial: null,
                    supportPins: null,
                    isWireless: nextCategory === "pcb" ? false : null,
                    switchPin: null,
                    switchType: null,
                    keycapMaterial: null,
                  });
                }}
                required
              >
                <option value="" disabled>
                  카테고리 선택
                </option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400">
                <Icon name="chevron" size={16} />
              </span>
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="상품 설명" hint="300자 이내로 입력해주세요">
              <textarea
                maxLength={300}
                className={`${inputClass} min-h-32 resize-y py-3`}
                name="description"
                placeholder="상품 설명을 입력해 주세요"
              />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection
        number="02"
        title="부품 상세 정보"
        description="선택한 카테고리에 맞는 규격과 소재를 입력해 주세요."
      >
        {!selectedCategory ? (
          <p className="text-sm text-zinc-400">
            먼저 기본 정보에서 상품 카테고리를 선택해 주세요.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {(selectedCategory === "housing" || selectedCategory === "pcb") && (
              <Field label="배열 규격">
                <select
                  className={inputClass}
                  value={spec.layout ?? ""}
                  onChange={(event) =>
                    setSpec((current) => ({
                      ...current,
                      layout: event.target.value || null,
                    }))
                  }
                >
                  <option value="">선택 안 함</option>
                  <option value="87">87</option>
                  <option value="75">75</option>
                  <option value="65">65</option>
                </select>
              </Field>
            )}

            {selectedCategory === "housing" && (
              <Field label="하우징 소재">
                <select
                  className={inputClass}
                  value={spec.housingMaterial ?? ""}
                  onChange={(event) =>
                    setSpec((current) => ({
                      ...current,
                      housingMaterial: event.target.value || null,
                    }))
                  }
                >
                  <option value="">선택 안 함</option>
                  <option value="알루미늄">알루미늄</option>
                  <option value="아크릴">아크릴</option>
                  <option value="폴리카보네이트">폴리카보네이트</option>
                  <option value="목재">목재</option>
                  <option value="플라스틱">플라스틱</option>
                </select>
              </Field>
            )}

            {selectedCategory === "pcb" && (
              <>
                <Field label="기판 지원 핀 규격">
                  <select
                    className={inputClass}
                    value={spec.supportPins ?? ""}
                    onChange={(event) =>
                      setSpec((current) => ({
                        ...current,
                        supportPins: event.target.value || null,
                      }))
                    }
                  >
                    <option value="">선택 안 함</option>
                    <option value="3">3핀</option>
                    <option value="5">5핀</option>
                  </select>
                </Field>
                <Field label="무선 지원">
                  <label className="flex h-11 items-center gap-2 text-sm text-zinc-700">
                    <input
                      checked={spec.isWireless === true}
                      className="h-4 w-4 accent-zinc-900"
                      onChange={(event) =>
                        setSpec((current) => ({
                          ...current,
                          isWireless: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                    무선 지원
                  </label>
                </Field>
              </>
            )}

            {selectedCategory === "switches" && (
              <>
                <Field label="스위치 핀 수">
                  <select
                    className={inputClass}
                    value={spec.switchPin ?? ""}
                    onChange={(event) =>
                      setSpec((current) => ({
                        ...current,
                        switchPin: event.target.value || null,
                      }))
                    }
                  >
                    <option value="">선택 안 함</option>
                    <option value="3">3핀</option>
                    <option value="5">5핀</option>
                  </select>
                </Field>
                <Field label="스위치 분류">
                  <select
                    className={inputClass}
                    value={spec.switchType ?? ""}
                    onChange={(event) =>
                      setSpec((current) => ({
                        ...current,
                        switchType: event.target.value || null,
                      }))
                    }
                  >
                    <option value="">선택 안 함</option>
                    <option value="linear">리니어</option>
                    <option value="tactile">택타일</option>
                    <option value="click">클릭</option>
                    <option value="silent">저소음</option>
                  </select>
                </Field>
              </>
            )}

            {selectedCategory === "keycaps" && (
              <Field label="키캡 소재">
                <select
                  className={inputClass}
                  value={spec.keycapMaterial ?? ""}
                  onChange={(event) =>
                    setSpec((current) => ({
                      ...current,
                      keycapMaterial: event.target.value || null,
                    }))
                  }
                >
                  <option value="">선택 안 함</option>
                  <option value="PBT">PBT</option>
                  <option value="ABS">ABS</option>
                  <option value="POM">POM</option>
                </select>
              </Field>
            )}
          </div>
        )}
      </FormSection>

      <FormSection
        number="03"
        title="가격 및 재고"
        description="판매 가격과 재고 수량을 입력해 주세요."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="판매 가격" required>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
                ₩
              </span>
              <input
                className={`${inputClass} pl-8`}
                inputMode="numeric"
                name="basePrice"
                placeholder="0"
                required
                value={price}
                onChange={(event) => setPrice(formatNumber(event.target.value))}
              />
            </div>
          </Field>
          <Field
            label="재고 수량"
            required
            hint="0 이상의 정수만 입력할 수 있습니다."
          >
            <input
              className={inputClass}
              min="0"
              name="stockQuantity"
              placeholder="0"
              required
              type="number"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        number="04"
        title="상품 이미지"
        description="대표 이미지 파일을 선택하면 서버에 업로드되어 상품 썸네일로 저장됩니다."
      >
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={(event) => handleImages(event.target.files)}
        />
        <button
          className="group flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 px-6 text-center transition hover:border-zinc-600 hover:bg-zinc-100/40"
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleImages(event.dataTransfer.files);
          }}
        >
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm group-hover:text-zinc-900">
            <Icon name="upload" size={19} />
          </span>
          <span className="text-sm font-semibold text-zinc-700">
            클릭하여 업로드{" "}
            <span className="font-normal text-zinc-400">
              또는 이미지를 여기로 끌어오세요
            </span>
          </span>
          <span className="mt-1.5 text-xs text-zinc-400">
            JPG, PNG, WEBP · 최대 5MB · 대표 썸네일 이미지 1개
          </span>
        </button>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={`${image.name}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
              >
                <img
                  className="h-full w-full object-cover"
                  src={image.url}
                  alt={image.name}
                />
                <button
                  aria-label={`이미지 ${image.name} 삭제`}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950/75 text-white opacity-0 backdrop-blur transition hover:bg-red-600 group-hover:opacity-100"
                  type="button"
                  onClick={() => removeImage(index)}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {error && (
          <p className="mr-auto text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {mode === "edit" && (
          <button
            className="h-11 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-900 px-6 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(0,0,0,0.1)] transition hover:bg-zinc-950 active:translate-y-px"
          disabled={submitting}
          type="submit"
        >
          <Icon name="check" size={17} />
          {submitting
            ? "등록 중..."
            : mode === "edit"
              ? "변경 사항 저장"
              : "상품 등록"}
        </button>
      </div>
    </form>
  );
}

function ProductList({
  onDialog,
  onRegister,
}: {
  onDialog: (type: DialogType) => void;
  onRegister: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-zinc-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px] flex-1 lg:max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              <Icon name="search" size={18} />
            </span>
            <input
              className={`${inputClass} pl-10`}
              placeholder="상품명을 검색해 주세요"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                className={`${inputClass} w-44 appearance-none pl-9 pr-9`}
                defaultValue=""
              >
                <option value="">전체 카테고리</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Icon name="filter" size={16} />
              </span>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400">
                <Icon name="chevron" size={14} />
              </span>
            </div>
            <div className="relative">
              <select
                className={`${inputClass} w-40 appearance-none pr-9`}
                defaultValue=""
              >
                <option value="">전체 상태</option>
                <option>판매 중</option>
                <option>판매 중지</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400">
                <Icon name="chevron" size={14} />
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            <span className="font-semibold text-zinc-800">0</span>개 상품
          </p>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-50"
              type="button"
              disabled
              onClick={() => onDialog("delete-selected")}
            >
              <Icon name="trash" size={15} />
              선택 삭제
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              type="button"
              onClick={() => onDialog("delete-all")}
            >
              <Icon name="trash" size={15} />
              전체 삭제
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-[0.05em] text-zinc-500">
            <tr>
              <th className="w-12 px-5 py-3.5">
                <input
                  aria-label="표시된 상품 전체 선택"
                  className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                  type="checkbox"
                  disabled
                />
              </th>
              <th className="px-3 py-3.5">상품 이미지</th>
              <th className="px-3 py-3.5">상품명</th>
              <th className="px-3 py-3.5">카테고리</th>
              <th className="px-3 py-3.5">판매가</th>
              <th className="px-3 py-3.5">재고</th>
              <th className="px-3 py-3.5">브랜드 / 제조사</th>
              <th className="px-3 py-3.5">판매 상태</th>
              <th className="px-3 py-3.5">등록일</th>
              <th className="px-5 py-3.5 text-right">관리</th>
            </tr>
          </thead>
        </table>
      </div>

      <div className="flex min-h-[380px] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400">
          <Icon name="box" size={35} strokeWidth={1.4} />
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-zinc-900 text-white">
            <Icon name="plus" size={13} strokeWidth={2.5} />
          </span>
        </div>
        <h3 className="text-base font-bold text-zinc-800">
          등록된 상품이 없습니다
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
          Spring Boot API에 상품을 연결하면 이곳에서 목록을 확인하고 관리할 수
          있습니다.
        </p>
        <button
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-950"
          type="button"
          onClick={onRegister}
        >
          <Icon name="plus" size={16} />첫 상품 등록하기
        </button>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4 text-xs text-zinc-400">
        <span>전체 0개 중 0개 표시</span>
        <div className="flex items-center gap-2">
          <button
            className="h-8 rounded-md border border-zinc-200 px-3"
            disabled
          >
            이전
          </button>
          <button
            className="h-8 rounded-md border border-zinc-200 px-3"
            disabled
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  type,
  onClose,
}: {
  type: Exclude<DialogType, null>;
  onClose: () => void;
}) {
  const isAll = type === "delete-all";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => event.currentTarget === event.target && onClose()}
    >
      <div
        aria-labelledby="dialog-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Icon name="alert" size={22} />
          </span>
          <button
            aria-label="대화상자 닫기"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <h2 id="dialog-title" className="mt-5 text-lg font-bold text-zinc-900">
          {isAll ? "모든 상품을 삭제할까요?" : "선택한 상품을 삭제할까요?"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {isAll
            ? "등록된 모든 상품이 영구 삭제되며 되돌릴 수 없습니다. 현재 삭제할 상품이 없습니다."
            : "선택한 상품은 영구 삭제되며 되돌릴 수 없습니다."}
        </p>
        {isAll && (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-xs font-medium leading-5 text-red-700">
            전체 삭제를 진행하려면 명시적인 확인이 필요합니다.
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-10 rounded-lg border border-zinc-200 px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isAll}
            title={isAll ? "삭제할 상품이 없습니다" : undefined}
            onClick={onClose}
          >
            {isAll ? "모든 상품 삭제" : "상품 삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({
  previewMode = false,
}: {
  previewMode?: boolean;
}) {
  // TODO(담당 5): 상품 목록, 수정, 삭제 API와 관리자 권한 확인을 연결합니다.
  const [view, setView] = useState<View>("register");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [toast, setToast] = useState("");

  const navigate = (next: View) => {
    setView(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 4200);
  };

  const pageTitle =
    view === "register"
      ? "상품 등록"
      : view === "list"
        ? "상품 목록"
        : "상품 수정";
  const pageDescription =
    view === "register"
      ? "새 상품을 등록하고 판매 정보를 설정해 주세요."
      : view === "list"
        ? "등록된 상품을 검색하고 관리해 주세요."
        : "상품 정보, 옵션, 이미지, 판매 상태를 수정해 주세요.";

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-800">
      {sidebarOpen && (
        <button
          aria-label="메뉴 닫기"
          className="fixed inset-0 z-30 bg-zinc-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-zinc-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center border-b border-zinc-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-[0_5px_14px_rgba(0,0,0,0.12)]">
            <Icon name="box" size={20} strokeWidth={2} />
          </div>
          <div className="ml-3">
            <div className="text-[15px] font-extrabold tracking-[-0.03em] text-zinc-900">
              MONO / KEYS
            </div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              관리자 콘솔
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-6">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            상품 관리
          </p>
          {[
            {
              id: "register" as View,
              label: "상품 등록",
              icon: "plus" as IconName,
            },
            {
              id: "list" as View,
              label: "상품 목록",
              icon: "list" as IconName,
            },
          ].map((item) => {
            const active =
              view === item.id || (view === "edit" && item.id === "list");
            return (
              <button
                key={item.id}
                className={`mb-1 flex h-11 w-full items-center rounded-lg px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
                onClick={() => navigate(item.id)}
              >
                <span
                  className={`mr-3 ${active ? "text-zinc-900" : "text-zinc-400"}`}
                >
                  <Icon name={item.icon} size={18} />
                </span>
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-zinc-900" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="m-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-zinc-500">
              <Icon name="user" size={17} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-zinc-700">관리자</p>
              <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                상품 관리자
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-zinc-200 bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center">
            <button
              aria-label="메뉴 열기"
              className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <div className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
              <span>관리자</span>
              <Icon name="chevron" size={13} />
              <span className="font-medium text-zinc-600">상품</span>
              {view === "edit" && (
                <>
                  <Icon name="chevron" size={13} />
                  <span className="font-medium text-zinc-600">수정</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-700 sm:inline">
              {previewMode ? "미리보기" : "시스템 정상"}
            </span>
            <button
              aria-label="알림"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100"
            >
              <Icon name="bell" size={19} />
              <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-zinc-900 ring-2 ring-white" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1240px] px-5 py-7 lg:px-8 lg:py-9">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-[-0.035em] text-zinc-950">
                {pageTitle}
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">{pageDescription}</p>
            </div>
            {view === "list" && (
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(0,0,0,0.1)] transition hover:bg-zinc-950"
                onClick={() => navigate("register")}
              >
                <Icon name="plus" size={16} />
                상품 등록
              </button>
            )}
          </div>

          {view === "list" ? (
            <ProductList
              onDialog={setDialog}
              onRegister={() => navigate("register")}
            />
          ) : (
            <ProductForm
              key={view}
              mode={view}
              onCancel={() => navigate("list")}
              onComplete={showToast}
            />
          )}
        </main>
      </div>

      {dialog && (
        <ConfirmDialog type={dialog} onClose={() => setDialog(null)} />
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900">
            <Icon name="check" size={15} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-sm font-bold text-zinc-800">
              입력 내용을 확인했습니다
            </p>
            <p className="mt-0.5 text-xs leading-5 text-zinc-500">{toast}</p>
          </div>
          <button
            aria-label="알림 닫기"
            className="text-zinc-400"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
