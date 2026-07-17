.elite-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 28px;
  color: #f5f1e8;
}

.elite-hero {
  min-height: 230px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 34px;
  border: 1px solid rgba(212, 175, 55, 0.32);
  border-radius: 16px;
  background:
    radial-gradient(
      circle at 80% 20%,
      rgba(212, 175, 55, 0.14),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      rgba(16, 19, 24, 0.98),
      rgba(5, 7, 10, 0.98)
    );
  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.34),
    inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.elite-tag {
  color: #d4af37;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.elite-hero h1 {
  margin: 10px 0 8px;
  color: #ffffff;
  font-family: var(--font-head, "Rajdhani", sans-serif);
  font-size: clamp(42px, 5vw, 68px);
  line-height: 0.95;
  text-transform: uppercase;
}

.elite-hero p {
  max-width: 650px;
  margin: 0;
  color: #aeb5bf;
  font-size: 16px;
  line-height: 1.65;
}

.elite-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.elite-card {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid rgba(212, 175, 55, 0.16);
  border-radius: 14px;
  background:
    linear-gradient(
      180deg,
      rgba(17, 20, 25, 0.97),
      rgba(8, 10, 13, 0.99)
    );
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.elite-card:hover {
  transform: translateY(-3px);
  border-color: rgba(212, 175, 55, 0.38);
  box-shadow: 0 22px 46px rgba(0, 0, 0, 0.32);
}

.elite-card h2 {
  margin: 0 0 18px;
  color: #d4af37;
  font-family: var(--font-head, "Rajdhani", sans-serif);
  font-size: 17px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.elite-card h3 {
  margin: 0 0 10px;
  color: #ffffff;
  font-family: var(--font-head, "Rajdhani", sans-serif);
  font-size: 27px;
}

.elite-card p {
  margin: 0 0 18px;
  color: #aeb5bf;
  line-height: 1.65;
}

.elite-card .goldButton,
.elite-hero .goldButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 20px;
  margin-top: auto;
  border: 1px solid rgba(255, 225, 120, 0.8);
  border-radius: 8px;
  background:
    linear-gradient(
      135deg,
      #b8860b,
      #ffd766,
      #d4af37
    );
  color: #080808;
  font-weight: 900;
  letter-spacing: 0.04em;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(212, 175, 55, 0.16);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.elite-card .goldButton:hover,
.elite-hero .goldButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(212, 175, 55, 0.24);
}

@media (max-width: 1100px) {
  .elite-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .elite-hero {
    align-items: flex-start;
    flex-direction: column;
    padding: 26px 22px;
  }

  .elite-hero .goldButton {
    width: 100%;
  }

  .elite-grid {
    grid-template-columns: 1fr;
  }

  .elite-card {
    min-height: auto;
  }

  .elite-card .goldButton {
    width: 100%;
  }
}