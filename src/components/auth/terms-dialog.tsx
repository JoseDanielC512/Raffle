'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Términos y Condiciones de Uso</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <p className="text-muted-foreground text-sm">Fecha de Vigencia: 23 de septiembre de 2025</p>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">1. Aceptación de los Términos</h3>
            <p className="leading-relaxed">Al acceder y utilizar la aplicación web <strong>Lucky 100 Raffle</strong> (en adelante, "la Plataforma" o "la Aplicación"), usted acepta y se compromete a cumplir con estos Términos y Condiciones de Uso. Si no está de acuerdo con estos términos, no debe utilizar la Plataforma. Nos reservamos el derecho de modificar estos términos en cualquier momento.</p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">2. Descripción del Servicio</h3>
            <p className="leading-relaxed"><strong>Lucky 100 Raffle</strong> es una herramienta digital que facilita la organización y gestión de rifas de 100 casillas. La Plataforma únicamente "simula" la ejecución de una rifa. Nuestra función es proporcionar un tablero interactivo y funcionalidades de gestión para los organizadores.</p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">3. Naturaleza de la Aplicación y Exclusión de Responsabilidad por Transacciones</h3>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li><strong>No somos una plataforma de juego de azar ni de apuestas.</strong></li>
              <li><strong>La Aplicación no procesa pagos, ni gestiona transacciones monetarias.</strong> La compra o venta de casillas y la entrega de premios se realizan <strong>completamente fuera de nuestra Plataforma</strong>, a través de acuerdos privados entre el organizador y los participantes.</li>
              <li><strong>No somos responsables de disputas financieras.</strong> No garantizamos la integridad, veracidad, o cumplimiento de los acuerdos de pago entre organizadores y participantes. Cualquier disputa relacionada con transacciones financieras, entrega de premios o cumplimiento de promesas es ajena a nuestra responsabilidad.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">4. Obligaciones de los Usuarios (Organizadores y Participantes)</h3>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li><strong>Veracidad de la Información:</strong> Usted es el único responsable de la veracidad y exactidad de la información que introduce en la Plataforma.</li>
              <li><strong>Cumplimiento de la Normativa Legal:</strong> El uso de la Plataforma es solo para fines legales. Los organizadores son enteramente responsables de asegurarse de que sus rifas cumplan con todas las leyes y regulaciones locales, departamentales y nacionales aplicables a la organización de sorteos en su jurisdicción.</li>
              <li><strong>Contenido Prohibido:</strong> No está permitido utilizar la Plataforma para rifas que promuevan contenido ilegal, fraudulento, difamatorio, obsceno o que viole derechos de terceros. Nos reservamos el derecho de eliminar cualquier rifa que consideremos inapropiada sin previo aviso.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">5. Propiedad Intelectual</h3>
            <p className="leading-relaxed">Todo el contenido, diseño, código, y software de la Plataforma son propiedad exclusiva de <strong>Lucky 100 Raffle</strong> o de sus licenciantes, y están protegidos por las leyes de propiedad intelectual. Usted no tiene derecho a copiar, modificar, distribuir o utilizar los materiales de la Plataforma sin nuestro consentimiento expreso.</p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">6. Limitación de Responsabilidad</h3>
            <p className="leading-relaxed">La Plataforma se ofrece "tal como está". No garantizamos que el servicio sea ininterrumpido o libre de errores. <strong>En ningún caso seremos responsables por daños directos, indirectos, incidentales, o consecuentes</strong> que resulten del uso o la imposibilidad de usar la Plataforma, incluyendo, pero no limitándose a, la pérdida de datos, interrupciones del servicio o disputas entre usuarios.</p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">7. Cancelación y Terminación de la Cuenta</h3>
            <p className="leading-relaxed">Nos reservamos el derecho de suspender o terminar su acceso a la Plataforma, sin previo aviso, si detectamos que ha violado estos Términos y Condiciones o ha realizado un uso fraudulento o indebido del servicio.</p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">8. Ley Aplicable y Jurisdicción</h3>
            <p className="leading-relaxed">Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Cualquier disputa o reclamo derivado de o en relación con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de Bucaramanga, Santander, Colombia.</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}