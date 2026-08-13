import { useState, useEffect } from 'react';
import { Phone, Clock, User, Sparkles } from 'lucide-react';
import { administration as staticAdministration } from '../lib/data';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Administration() {
  const {
    ref,
    isVisible,
  } = useScrollAnimation<HTMLDivElement>();

  const [administrationData, setAdministrationData] =
    useState<any[]>([]);

  // ==================================================
  // LOCAL STORAGE DAN MA'LUMOT OLISH
  // ==================================================

  const loadAdministration = () => {
    const saved = localStorage.getItem('administration');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setAdministrationData(parsed);
        } else {
          setAdministrationData(staticAdministration);
        }
      } catch (error) {
        console.error(
          'Administration data error:',
          error
        );

        setAdministrationData(staticAdministration);
      }
    } else {
      setAdministrationData(staticAdministration);
    }
  };

  // ==================================================
  // INITIAL LOAD + LIVE UPDATE
  // ==================================================

  useEffect(() => {
    loadAdministration();

    const handleStorageChange = () => {
      loadAdministration();
    };

    window.addEventListener(
      'storage',
      handleStorageChange
    );

    // Admin panel bilan bir oynada ishlaganda
    // ham yangilanib turadi
    const interval = setInterval(
      loadAdministration,
      1000
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange
      );

      clearInterval(interval);
    };
  }, []);

  return (
    <section
      id="administration"
      className="
        apple-section
        relative
        overflow-hidden
        py-20
      "
    >

      {/* ==================================================
          BACKGROUND DECORATION
      ================================================== */}

      <div className="
        pointer-events-none
        absolute
        inset-0
        -z-10
        overflow-hidden
      ">

        {/* Left glow */}

        <div
          className="
            absolute
            left-[-180px]
            top-[5%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-200/20
            blur-3xl
            animate-liquid
          "
        />

        {/* Right glow */}

        <div
          className="
            absolute
            right-[-180px]
            bottom-[5%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-indigo-200/20
            blur-3xl
            animate-liquid
          "
          style={{
            animationDelay: '3s',
          }}
        />

      </div>

      <div className="
        apple-container
        mx-auto
        max-w-6xl
        px-4
      ">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className={`
            mx-auto
            mb-16
            max-w-3xl
            text-center

            transition-all
            duration-1000
            ease-out

            ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }
          `}
        >

          {/* Eyebrow */}

          <div className="
            mb-4
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-blue-100
            bg-blue-50/70
            px-4
            py-1.5
            text-xs
            font-bold
            uppercase
            tracking-widest
            text-[#0071e3]
            shadow-sm
            backdrop-blur-md
          ">

            <Sparkles className="h-3.5 w-3.5" />

            Ma'muriyat

          </div>

          <h2 className="
            text-3xl
            font-extrabold
            tracking-tight
            text-[#1d1d1f]
            sm:text-5xl
            md:text-6xl
          ">
            Rahbariyat va
            <br className="hidden sm:block" />

            <span className="text-gradient-blue">
              {' '}qabul kunlari
            </span>
          </h2>

          <p className="
            mt-5
            text-base
            font-normal
            leading-relaxed
            text-[#6e6e73]
            sm:text-lg
          ">
            Maktab ma'muriyati a'zolari,
            ularning lavozimlari va fuqarolarni
            qabul qilish kunlari
          </p>

        </div>

        {/* ==================================================
            ADMINISTRATION CARDS
        ================================================== */}

        <div
          ref={ref}
          className="
            grid
            gap-6
            sm:grid-cols-2
          "
        >

          {administrationData.map(
            (person: any, index: number) => (

              <div
                key={person.id || index}
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-[32px]

                  border
                  border-white/80

                  bg-white/65
                  p-6

                  shadow-[0_10px_40px_rgba(15,23,42,0.06)]

                  backdrop-blur-2xl

                  transition-all
                  duration-700
                  ease-[cubic-bezier(0.16,1,0.3,1)]

                  hover:-translate-y-2
                  hover:shadow-[0_25px_60px_rgba(15,23,42,0.12)]

                  ${
                    isVisible
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-12 scale-[0.96]'
                  }
                `}
                style={{
                  transitionDelay: `${index * 120}ms`,
                }}
              >

                {/* ==================================================
                    CARD GLOW
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-24
                    -top-24
                    h-52
                    w-52
                    rounded-full
                    bg-blue-300/15
                    blur-3xl

                    transition-all
                    duration-700

                    group-hover:scale-150
                    group-hover:bg-blue-300/25
                  "
                />

                {/* ==================================================
                    TOP LIGHT
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-white
                    to-transparent
                  "
                />

                <div className="
                  relative
                  z-10
                  flex
                  flex-col
                  items-center
                  gap-6
                  sm:flex-row
                  sm:items-start
                ">

                  {/* ==================================================
                      PHOTO
                  ================================================== */}

                  <div className="
                    relative
                    shrink-0
                  ">

                    {/* Glow behind photo */}

                    <div
                      className="
                        absolute
                        inset-0
                        rounded-[24px]
                        bg-blue-400/20
                        blur-xl
                        opacity-0

                        transition-opacity
                        duration-500

                        group-hover:opacity-100
                      "
                    />

                    <div
                      className="
                        relative
                        h-28
                        w-28
                        overflow-hidden
                        rounded-[24px]

                        border
                        border-white

                        bg-gradient-to-br
                        from-blue-50
                        via-white
                        to-slate-100

                        shadow-lg
                        shadow-slate-900/10

                        transition-all
                        duration-500

                        group-hover:scale-105
                        group-hover:rotate-1
                      "
                    >

                      <img
                        src={
                          person.image ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
                        }
                        alt={person.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          object-center

                          transition-transform
                          duration-700

                          group-hover:scale-110
                        "
                        loading="lazy"
                      />

                      {/* Image overlay */}

                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/10
                          via-transparent
                          to-white/20

                          opacity-0

                          transition-opacity
                          duration-500

                          group-hover:opacity-100
                        "
                      />

                    </div>

                  </div>

                  {/* ==================================================
                      INFO
                  ================================================== */}

                  <div className="
                    flex
                    flex-1
                    flex-col
                    justify-center
                    text-center
                    sm:text-left
                  ">

                    <h3 className="
                      text-xl
                      font-bold
                      tracking-tight
                      text-[#1d1d1f]

                      transition-colors
                      duration-300

                      group-hover:text-[#0071e3]
                    ">
                      {person.name}
                    </h3>

                    <p className="
                      mt-1
                      text-sm
                      font-semibold
                      text-[#0071e3]
                    ">
                      {person.role ||
                        person.position ||
                        "Lavozim ko'rsatilmagan"}
                    </p>

                    {/* Divider */}

                    <div className="
                      my-4
                      h-px
                      w-full
                      bg-gradient-to-r
                      from-black/5
                      via-black/10
                      to-transparent
                    " />

                    {/* ==================================================
                        RECEPTION
                    ================================================== */}

                    {person.reception && (
                      <div className="
                        mb-2.5
                        flex
                        items-center
                        justify-center
                        gap-2.5
                        text-xs
                        font-medium
                        text-[#6e6e73]
                        sm:justify-start
                        sm:text-sm
                      ">

                        <div
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#0071e3]/10
                            text-[#0071e3]

                            transition-transform
                            duration-300

                            group-hover:scale-110
                          "
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </div>

                        <span>
                          {person.reception}
                        </span>

                      </div>
                    )}

                    {/* ==================================================
                        PHONE
                    ================================================== */}

                    {person.phone && (
                      <div className="
                        flex
                        items-center
                        justify-center
                        gap-2.5
                        text-xs
                        font-medium
                        text-[#6e6e73]
                        sm:justify-start
                        sm:text-sm
                      ">

                        <div
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#0071e3]/10
                            text-[#0071e3]

                            transition-transform
                            duration-300

                            group-hover:scale-110
                          "
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </div>

                        <span>
                          {person.phone}
                        </span>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {administrationData.length === 0 && (
          <div className="
            mx-auto
            max-w-xl
            rounded-[32px]
            border
            border-white/70
            bg-white/60
            p-14
            text-center
            shadow-xl
            backdrop-blur-xl
          ">

            <div className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-blue-50
            ">
              <User
                className="
                  h-8
                  w-8
                  text-[#0071e3]
                "
              />
            </div>

            <p className="
              mt-5
              text-sm
              font-medium
              text-[#6e6e73]
            ">
              Hozircha ma'muriyat ma'lumotlari
              mavjud emas.
            </p>

          </div>
        )}

        {/* ==================================================
            NOTICE
        ================================================== */}

        <div
          className="
            mx-auto
            mt-12
            flex
            max-w-4xl
            items-center
            justify-center
            gap-3

            rounded-[24px]

            border
            border-white/70

            bg-white/50
            px-5
            py-4

            text-center

            shadow-lg
            shadow-slate-900/5

            backdrop-blur-xl

            transition-all
            duration-500

            hover:bg-white/70
            hover:-translate-y-1
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#0071e3]/10
              text-[#0071e3]
            "
          >
            <User className="h-4 w-4" />
          </div>

          <p className="
            text-xs
            font-medium
            leading-relaxed
            text-[#6e6e73]
            sm:text-sm
          ">
            Qabul kunlari dam olish kunlari va
            rasmiy bayramlardan tashqari har kuni
            amalga oshiriladi
          </p>

        </div>

      </div>
    </section>
  );
}