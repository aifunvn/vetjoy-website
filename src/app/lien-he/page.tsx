import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/features/contact/ContactForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Liên hệ với ${siteConfig.brandName} để được hỗ trợ.`,
  alternates: { canonical: "/lien-he" },
};

export default function ContactPage() {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Liên hệ VETJOY</h1>
      <ul className="mt-4 space-y-1 text-sm text-neutral-600">
        <li>{siteConfig.contact.addressPlaceholder}</li>
        <li>Điện thoại: {siteConfig.contact.phoneDisplay}</li>
        <li>Email: {siteConfig.contact.email}</li>
      </ul>
      <div className="mt-8">
        <ContactForm />
      </div>
    </Container>
  );
}
