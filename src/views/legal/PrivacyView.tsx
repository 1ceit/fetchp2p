"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, ArrowLeft, Check } from "lucide-react";
import WaveDivider from "@/components/ui/WaveDivider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import ScrollToTop from "@/components/ui/ScrollToTop";

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (copyErr) {
        console.error("Fallback copy failed", copyErr);
      }
      textArea.remove();
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.location.hash = id;
  };

  return (
    <section
      id={id}
      className="scroll-mt-24 group p-6 -m-6 rounded-2xl transition-all duration-500 target:bg-orange-500/5 target:ring-1 target:ring-orange-500/10"
    >
      <div className="flex items-center gap-3 mb-4">
        <h2
          className="text-[24px] font-bold tracking-tight"
          style={{ color: "var(--color-ink)" }}
        >
          {title}
        </h2>
        <a
          href={`#${id}`}
          onClick={handleCopy}
          className="relative flex items-center gap-1.5 transition-all opacity-0 group-hover:opacity-30 hover:opacity-100!"
          style={{ opacity: copied ? 1 : undefined }}
          aria-label="Copy link to this section"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Check size={18} />
              </motion.div>
            ) : (
              <motion.div
                key="link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group-hover:opacity-100 transition-opacity"
              >
                <LinkIcon size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </a>
      </div>
      <div className="flex flex-col gap-6 text-[15px] leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
        {children}
      </div>
    </section>
  );
};

const SubSection = ({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    if (!id) return;
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (copyErr) {
        console.error("Fallback copy failed", copyErr);
      }
      textArea.remove();
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.location.hash = id;
  };

  return (
    <div
      className="flex flex-col gap-2 group/sub scroll-mt-24 p-4 -m-4 rounded-xl transition-all duration-500 target:bg-orange-500/5 target:ring-1 target:ring-orange-500/10"
      id={id}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-[17px] font-bold" style={{ color: "var(--color-ink)" }}>{title}</h3>
        {id && (
          <a
            href={`#${id}`}
            onClick={handleCopy}
            className="relative flex items-center gap-1.5 transition-all opacity-0 group-hover/sub:opacity-30 hover:opacity-100!"
            style={{ opacity: copied ? 1 : undefined }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check-sub"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  <Check size={12} />
                </motion.div>
              ) : (
                <motion.div
                  key="link-sub"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group-hover/sub:opacity-100 transition-opacity"
                >
                  <LinkIcon size={14} />
                </motion.div>
              )}
            </AnimatePresence>
          </a>
        )}
      </div>
      <div className="pl-0">{children}</div>
    </div>
  );
};

export default function PrivacyView() {
  const router = useRouter();
  const lastUpdated = "March 21, 2026";

  return (
    <div className="w-full">
      <ThemeToggle />
      <div
        className="min-h-screen flex flex-col items-center px-6 pt-24 pb-20"
        style={{ background: "var(--color-paper)" }}
      >
        <div className="w-full max-w-4xl mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Home
          </Button>
        </div>

        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-20">
            <h1
              className="text-[clamp(2.5rem,8vw,4.5rem)] font-bold tracking-tighter mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Privacy Policy
            </h1>
            <p className="text-[14px] italic opacity-40">Last Updated: {lastUpdated}</p>
          </div>

          <div className="flex flex-col gap-16">
            <Section id="1-introduction" title="1. Introduction">
              <p>
                This Privacy Policy explains how FetchP2P (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) manages your information. Unlike traditional file sharing platforms, FetchP2P is designed with a &quot;Privacy First&quot; architecture. We prioritize peer-to-peer connectivity to ensure that your data remains your own. By using our Services, you acknowledge the data practices described in this policy.
              </p>
            </Section>

            <Section id="2-information-we-collect" title="2. Information We Collect">
              <p>We collect minimal information to ensure service availability and security. Our architecture is designed to avoid the collection of personal data wherever possible.</p>

              <SubSection id="2-network-and-visit-data" title="Network and Visit Data">
                <p>Through our infrastructure providers (including Cloudflare), we may process standard web logs such as IP addresses, browser types, and geolocation data. This data is used solely for rate limiting, DDoS protection, and ensuring the technical stability of our signaling servers.</p>
              </SubSection>

              <SubSection id="2-transfer-metadata" title="Transfer Metadata">
                <p>We monitor aggregate usage metrics, specifically the <strong>total number of bytes transferred</strong> through the network. This data is processed as a raw numerical value and is not linked to any specific user, file content, or metadata. We do not collect or store filenames, file types, or directory structures.</p>
              </SubSection>

              <SubSection id="2-authentication" title="Authentication &amp; Session Data">
                <p>FetchP2P does not use accounts or persistent authentication. All session data, including the 5-character transfer codes, is ephemeral and exists only for the duration of the active connection between peers.</p>
              </SubSection>
            </Section>

            <Section id="3-how-we-use-information" title="3. How We Use Information">
              <SubSection title="Service Operations">
                <p>We use temporary signaling data to establish Peer-to-Peer connections (WebRTC) between users. Once the connection is established, our involvement in the data stream ceases.</p>
              </SubSection>
              <SubSection title="Analytics and Growth">
                <p>Aggregate byte counts are used to understand overall platform usage and to share growth milestones with our community. No individual transfer patterns are analyzed.</p>
              </SubSection>
              <SubSection title="Security">
                <p>IP data is used to prevent automated abuse of our signaling server and to maintain the integrity of our Peer-to-Peer network.</p>
              </SubSection>
            </Section>

            <Section id="4-data-storage-and-access" title="4. Data Storage and Access">
              <SubSection title="Zero Server Storage">
                <p>Our core principle is that <strong>no user files are stored on our servers</strong>. Data streams directly browser-to-browser. There is no central database of transfers, and there is no &quot;history&quot; of sent files once a session ends.</p>
              </SubSection>
              <SubSection title="Signaling Server Access">
                <p>Developers may have access to signaling server logs for debugging purposes. These logs contain ephemeral connection metadata but no content-level data.</p>
              </SubSection>
            </Section>

            <Section id="5-data-security-and-protection" title="5. Data Security and Protection">
              <SubSection title="Technical Security">
                <p>All transfers are encrypted end-to-end using WebRTC standards (DTLS/SRTP). This ensures that even our signaling infrastructure cannot read the data passing between peers.</p>
              </SubSection>
              <SubSection title="Browser Sandbox">
                <p>We leverage the browser&apos;s security model to ensure that file access is isolated and secure. No software installation is required, reducing the attack surface on your device.</p>
              </SubSection>
            </Section>

            <Section id="6-data-retention-and-deletion" title="6. Data Retention and Deletion">
              <SubSection title="Ephemeral Records">
                <p>Signaling data and transfer codes are deleted immediately after the transfer is completed or the session times out. Aggregate traffic statistics (byte counts) are retained indefinitely for historical analysis.</p>
              </SubSection>
            </Section>

            <Section id="7-third-party-services" title="7. Third-Party Services">
              <p>We work with trusted infrastructure providers to deliver the Service:</p>
              <SubSection title="Cloudflare">
                <p>Used for DNS, CDN, and network security. Cloudflare processes request data in accordance with their own privacy standards to protect our site from attacks.</p>
              </SubSection>
            </Section>

            <Section id="8-user-rights" title="8. User Rights and Data Control">
              <p>Because we do not collect personal identifiers or store your files, we have no &quot;Personal Data&quot; to provide, correct, or delete upon request. Your primary control is your 5-character code; do not share it with unauthorized parties.</p>
            </Section>

            <Section id="9-cookies" title="9. Cookies and Tracking">
              <p>FetchP2P uses no tracking or marketing cookies. We may use essential local storage to remember your theme preference (Light/Dark mode) or to manage active P2P sessions.</p>
            </Section>

            <Section id="10-age-restrictions" title="10. Age Restrictions">
              <p>The Service is not intended for users under 13. By using FetchP2P, you represent that you meet the age requirements in your jurisdiction.</p>
            </Section>

            <Section id="11-international-transfers" title="11. International Data Transfers">
              <p>Our signaling server may be located in a different country than you. By using the Service, you consent to the transfer of minimal signaling metadata to establish your P2P connection globally.</p>
            </Section>

            <Section id="12-changes" title="12. Changes to This Policy">
              <p>We may modify this policy. Continued use of the Service after changes constitutes acceptance. Major changes will be highlighted on our homepage.</p>
            </Section>

            <Section id="13-contact" title="13. Contact Information">
              <p>For privacy-related inquiries, contact me at <a className="font-bold hover:underline" href="mailto:cj@1ceit.com" target="_blank" rel="noopener noreferrer">cj@1ceit.com</a>.</p>
            </Section>
          </div>
        </motion.div>
      </div>
      <WaveDivider />
      <ScrollToTop />
    </div>
  );
}
