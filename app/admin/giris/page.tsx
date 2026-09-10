import GirisFormu from "@/components/admin/GirisFormu";
import { isAuthConfigured } from "@/lib/auth";
import { site } from "@/lib/site";

export default function GirisSayfasi() {
  return (
    <div className="yp-giris">
      <GirisFormu marka={site.name} sifreTanimli={isAuthConfigured()} />
    </div>
  );
}
