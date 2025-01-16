import { IonIcon, IonLabel, IonTabBar, IonTabButton } from "@ionic/react";
import { home, search, list, person, storefront } from "ionicons/icons";

const BottomNavigationBar: React.FC = () => (
    <IonTabBar slot="bottom" color="primary">

        <IonTabButton tab="stores" href="/stores">
            <IonIcon aria-hidden="true" icon={storefront} />
            <IonLabel>Stores</IonLabel>
        </IonTabButton>

        <IonTabButton tab="home" href="/home">
            <IonIcon aria-hidden="true" icon={home} />
            <IonLabel>Home</IonLabel>
        </IonTabButton>

        <IonTabButton tab="search" href="/search">
            <IonIcon aria-hidden="true" icon={search} />
            <IonLabel>Search</IonLabel>
        </IonTabButton>

        <IonTabButton tab="shoppinglist" href="/shoppinglist">
            <IonIcon aria-hidden="true" icon={list} />
            <IonLabel>Shopping List</IonLabel>
        </IonTabButton>

        <IonTabButton tab="account" href="/account">
            <IonIcon aria-hidden="true" icon={person} />
            <IonLabel>Account</IonLabel>
        </IonTabButton>

    </IonTabBar>
);
export default BottomNavigationBar;
