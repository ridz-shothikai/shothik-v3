import * as motion from "motion/react-client";
import Image from "next/image";
const brands = ["IBM", "lya", "spotify", "netflix", "hbo", "amazon"];

export default function AboutVision() {
  return (
    <div className="mt-10 mb-5">
      <div className="mb-10 rounded-lg overflow-hidden relative">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Image
            alt="about-vision"
            src="/secondary/vision_banner.jpg"
            height={500}
            width={500}
            style={{
              width: "100%",
              borderRadius: "20px",
            }}
          />
        </motion.div>

        <div className="flex flex-row flex-wrap items-center justify-center gap-3 absolute bottom-6 md:bottom-10 w-full opacity-50">
          {brands.map((logo, i) => (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 * (i + 1) }}
              viewport={{ once: true }}
              key={logo}
            >
              <Image
                alt={logo}
                height={50}
                width={50}
                src={`/brands/ic_brand_${logo.toLowerCase()}.svg`}
              />
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold text-center max-w-[800px] mx-auto">
          Our vision is to revolutionize writing with powerful AI-driven
          assistance, Shothik AI.
        </h3>
      </motion.div>
    </div>
  );
}
