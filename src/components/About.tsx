import { Target, Lightbulb, Heart, Users } from 'lucide-react';
import { goals, historyTimeline } from '@/lib/data';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const iconMap: Record<string, typeof Target> = {
  Target,
  Lightbulb,
  Heart,
  Users,
};

export default function About() {
  const {
    ref: goalsRef,
    isVisible: goalsVisible,
  } = useScrollAnimation<HTMLDivElement>();

  const {
    ref: timelineRef,
    isVisible: timelineVisible,
  } = useScrollAnimation<HTMLDivElement>();

  return (
    <section
      id="about"
      className="
        apple-section
        relative
        overflow-hidden
      "
    >

      {/* ==================================================
          BACKGROUND GLOW
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div
          className="
            absolute
            left-[-150px]
            top-[15%]
            h-[350px]
            w-[350px]
            rounded-full
            bg-blue-200/20
            blur-3xl
            animate-float
          "
        />

        <div
          className="
            absolute
            right-[-150px]
            top-[45%]
            h-[400px]
            w-[400px]
            rounded-full
            bg-purple-200/15
            blur-3xl
            animate-liquid
          "
          style={{
            animationDelay: '2s',
          }}
        />

      </div>

      <div className="apple-container">

        {/* ==================================================
            SECTION HEADER
        ================================================== */}

        <div
          className={`
            mx-auto
            mb-16
            max-w-3xl
            text-center
            transition-all
            duration-1000
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              goalsVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }
          `}
        >

          <p
            className="
              apple-eyebrow
              mb-4
              animate-pulse
            "
          >
            Maktab haqida
          </p>

          <h2 className="apple-heading">
            Maqsadlarimiz va tariximiz
          </h2>

          <p className="apple-subheading mt-4">
            2022-yildan beri iqtidorli o'quvchilarni
            kelajak yetakchilariga aylantirib kelyapmiz
          </p>

        </div>

        {/* ==================================================
            GOALS
        ================================================== */}

        <div
          ref={goalsRef}
          className="
            grid
            gap-6
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          {goals.map((goal, index) => {
            const Icon =
              iconMap[goal.icon] ?? Target;

            return (
              <div
                key={index}
                className={`
                  apple-card
                  group
                  relative
                  overflow-hidden
                  transition-all
                  duration-700
                  ease-[cubic-bezier(0.16,1,0.3,1)]

                  ${
                    goalsVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-12'
                  }
                `}
                style={{
                  transitionDelay: `${index * 120}ms`,
                }}
              >

                {/* Card shine */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-40
                    w-40
                    rounded-full
                    bg-blue-200/20
                    blur-3xl
                    transition-all
                    duration-700
                    group-hover:scale-[2]
                    group-hover:bg-blue-300/30
                  "
                />

                {/* Icon */}

                <div
                  className="
                    relative
                    z-10
                    mb-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#0071e3]/10
                    transition-all
                    duration-500
                    group-hover:scale-110
                    group-hover:rotate-3
                    group-hover:bg-[#0071e3]/15
                    group-hover:shadow-lg
                    group-hover:shadow-blue-500/20
                  "
                >

                  <Icon
                    className="
                      h-6
                      w-6
                      text-[#0071e3]
                      transition-transform
                      duration-500
                      group-hover:scale-110
                    "
                    strokeWidth={2}
                  />

                </div>

                {/* Text */}

                <h3
                  className="
                    relative
                    z-10
                    mb-2
                    text-lg
                    font-semibold
                    text-[#1d1d1f]
                    transition-colors
                    duration-300
                    group-hover:text-[#0071e3]
                  "
                >
                  {goal.title}
                </h3>

                <p
                  className="
                    relative
                    z-10
                    text-sm
                    font-normal
                    leading-relaxed
                    text-[#6e6e73]
                  "
                >
                  {goal.description}
                </p>

                {/* Bottom line */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-8
                    right-8
                    h-[2px]
                    origin-left
                    scale-x-0
                    rounded-full
                    bg-gradient-to-r
                    from-[#0071e3]
                    to-cyan-400
                    transition-transform
                    duration-500
                    group-hover:scale-x-100
                  "
                />

              </div>
            );
          })}

        </div>

        {/* ==================================================
            TIMELINE
        ================================================== */}

        <div
          ref={timelineRef}
          className="
            relative
            mt-24
          "
        >

          {/* Timeline header */}

          <div
            className={`
              mb-12
              text-center
              transition-all
              duration-1000
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                timelineVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }
            `}
          >

            <h3
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-[#1d1d1f]
                sm:text-3xl
              "
            >
              Tarixiy xronologiya
            </h3>

            <p
              className="
                mt-3
                text-base
                font-normal
                text-[#6e6e73]
              "
            >
              Maktabning rivojlanish yo'nalishi —
              yildan yilga
            </p>

          </div>

          {/* Timeline container */}

          <div className="relative mx-auto max-w-3xl">

            {/* Timeline line */}

            <div
              className={`
                absolute
                left-4
                top-0
                h-full
                w-px
                origin-top
                bg-gradient-to-b
                from-[#0071e3]
                via-[#0071e3]/30
                to-transparent

                transition-transform
                duration-[1500ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]

                sm:left-1/2
                sm:-translate-x-1/2

                ${
                  timelineVisible
                    ? 'scale-y-100'
                    : 'scale-y-0'
                }
              `}
            />

            {historyTimeline.map(
              (item, index) => (
                <div
                  key={index}
                  className={`
                    relative
                    mb-12
                    flex
                    flex-col
                    gap-4
                    pl-12

                    sm:w-1/2
                    sm:pl-0

                    ${
                      index % 2 === 0
                        ? 'sm:pr-12 sm:text-right'
                        : 'sm:ml-auto sm:pl-12'
                    }

                    transition-all
                    duration-800
                    ease-[cubic-bezier(0.16,1,0.3,1)]

                    ${
                      timelineVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-12'
                    }
                  `}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                  }}
                >

                  {/* ==================================================
                      TIMELINE DOT
                  ================================================== */}

                  <div
                    className={`
                      absolute
                      top-1.5
                      left-0
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      shadow-md
                      ring-4
                      ring-[#0071e3]/10

                      transition-all
                      duration-500

                      hover:scale-125
                      hover:ring-[#0071e3]/20

                      sm:left-auto

                      ${
                        index % 2 === 0
                          ? 'sm:-right-4'
                          : 'sm:-left-4'
                      }
                    `}
                  >

                    <div
                      className="
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-[#0071e3]
                        shadow-[0_0_12px_rgba(0,113,227,0.6)]
                        animate-glow
                      "
                    />

                  </div>

                  {/* ==================================================
                      TIMELINE CARD
                  ================================================== */}

                  <div
                    className="
                      apple-card
                      group
                      !p-6
                      transition-all
                      duration-500
                      hover:-translate-y-2
                    "
                  >

                    <div
                      className="
                        mb-1
                        text-2xl
                        font-bold
                        text-[#0071e3]
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      "
                    >
                      {item.year}
                    </div>

                    <h4
                      className="
                        mb-2
                        text-lg
                        font-semibold
                        text-[#1d1d1f]
                        transition-colors
                        duration-300
                        group-hover:text-[#0071e3]
                      "
                    >
                      {item.title}
                    </h4>

                    <p
                      className="
                        text-sm
                        font-normal
                        leading-relaxed
                        text-[#6e6e73]
                      "
                    >
                      {item.description}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>
    </section>
  );
}