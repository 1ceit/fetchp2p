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


export default function TermsView() {
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
              Terms of Use
            </h1>
            <p className="text-[14px] italic opacity-40">Last Updated: {lastUpdated}</p>
          </div>

          <div className="flex flex-col gap-16">
            <Section id="1-acceptance" title="1. Acceptance of Terms">
              <p>
                By accessing or using FetchP2P services, including our website, signaling infrastructure, and any related utilities (collectively, &apos;Services&apos;), you agree to be bound by these Terms of Use and our Privacy Policy. You must be at least 13 years old to use our services. If you are using our Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
              </p>
            </Section>

            <Section id="2-description" title="2. Service Description">
              <p>
                FetchP2P provides browser-based peer-to-peer file streaming tools. Our Services facilitate the direct connection between two web browsers to enable end-to-end encrypted data transfer without intermediate server storage. We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time without prior notice.
              </p>
            </Section>

            <Section id="3-responsibilities" title="3. User Responsibilities">
              <p>
                You are responsible for all activities that occur through your use of the Service. You agree to provide accurate information when required and are solely responsible for all content you choose to transmit through the peer-to-peer connection established by our signaling infrastructure.
              </p>
            </Section>

            <Section id="4-prohibited-conduct" title="4. Prohibited Conduct">
              <p>You agree not to: (a) use the Services for any unlawful purpose; (b) attempt to disrupt the signaling server; (c) interfere with the P2P connection established between other users; (d) attempt to reverse engineer any portion of the Services; (e) use automated means to bombard our signaling infrastructure; (f) engage in harassment or abuse of the Peer-to-Peer network.</p>
            </Section>

            <Section id="5-data-monitoring" title="5. Data Access and Monitoring">
              <p>FetchP2P facilitates private, encrypted connections. While we <strong>cannot</strong> access or monitor the content of your file transfers, we reserve the right to monitor signaling traffic and aggregate network metadata (such as byte counts and connection success rates) for service improvement, security monitoring, and abuse detection. By using our Services, you consent to this metadata monitoring.</p>
            </Section>

            <Section id="6-enforcement" title="6. Enforcement and Moderation">
              <p>We maintain absolute discretion in enforcing these Terms. We may take any action we deem necessary, including but not limited to: rate-limiting specific IPs, blocking access to the signaling server, and termination of service for specific networks. We are not obligated to provide warnings before taking enforcement actions.</p>
            </Section>

            <Section id="7-community" title="7. Network Management">
              <p>FetchP2P reserves the right to restrict access from specific domains or networks at our sole discretion to maintain the stability of the signaling infrastructure and protect the user community from abuse.</p>
            </Section>

            <Section id="8-ip" title="8. Intellectual Property and Copyright">
              <p>All code, design, logos, and technical architecture of FetchP2P are the intellectual property of its creators and are protected by international copyright laws. Any unauthorized reproduction or usage of the source code or proprietary assets is strictly prohibited.</p>
            </Section>

            <Section id="9-privacy" title="9. Data and Privacy">
              <p>Your use of our Services is governed by our Privacy Policy. By using FetchP2P, you consent to the handling of connection metadata as detailed in that policy. We implement industry-standard encryption for all transfers, but you acknowledge that local device security is your responsibility.</p>
            </Section>

            <Section id="10-warranties" title="10. Disclaimer of Warranties">
              <p>The Services are provided <strong>&apos;as is&apos;</strong> and <strong>&apos;as available&apos;</strong> without warranties of any kind. We do not warrant that the Services will be uninterrupted, that P2P connections will always be established successfully across all firewalls, or that the Service is error-free.</p>
            </Section>

            <Section id="11-liability" title="11. Limitation of Liability">
              <p>To the maximum extent permitted by law, FetchP2P and its creators shall not be liable for any indirect, incidental, or consequential damages (including data loss or hardware failure) resulting from your use of the P2P transfer tools.</p>
            </Section>

            <Section id="12-indemnification" title="12. Indemnification">
              <p>You agree to defend and hold harmless FetchP2P and its developers from any claims, damages, or losses arising out of your misuse of the Service or your breach of these Terms.</p>
            </Section>

            <Section id="13-termination" title="13. Termination">
              <p>We may terminate or suspend your access to the signaling infrastructure immediately, without notice, for any reason. Upon termination, your ability to establish new P2P connections via our Service will cease.</p>
            </Section>

            <Section id="14-third-party" title="14. Third-Party Services">
              <p>Our infrastructure relies on third-party providers like Cloudflare and various STUN/TURN server providers. We are not responsible for their service availability or privacy policies.</p>
            </Section>

            <Section id="15-governing-law" title="15. Governing Law">
              <p>These Terms shall be governed by and construed in accordance with the laws of the United States. Any dispute arising from these Terms shall be resolved through constructive dialogue or within the appropriate legal jurisdiction as required by law.</p>
            </Section>

            <Section id="16-modifications" title="16. Modifications to Terms">
              <p>We reserve the right to modify these Terms at any time. Significant changes will be announced on the Homepage. Continued use of the Service after modifications constitutes your acceptance.</p>
            </Section>

            <Section id="17-severability" title="17. Severability">
              <p>If any provision of these Terms is found to be invalid, the remaining provisions will remain in full force and effect. These Terms constitute the entire agreement regarding your use of FetchP2P.</p>
            </Section>

            <Section id="contact" title="Contact Information">
              <p>For questions regarding these terms, contact me at <a className="font-bold hover:underline" href="mailto:cj@1ceit.com" target="_blank" rel="noopener noreferrer">cj@1ceit.com</a>.</p>
            </Section>
          </div>
        </motion.div>
      </div>
      <WaveDivider />
      <ScrollToTop />
    </div>
  );
}
