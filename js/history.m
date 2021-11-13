dsensor=0.25;
InverseFB = ifanbeam(FB,D,'FanSensorSpacing',dsensor,'OutputSize',256);
imshow(InverseFB,[])
FB(150,:)=0;
InverseFB = ifanbeam(FB,D,'FanSensorSpacing',dsensor,'OutputSize',256);
imshow(InverseFB,[])
imshow(InverseFB,[0,1])
imshow(FB,[])
save CT
rhead = iradon(R_new, theta, 'none')
rhead = iradon(R_new, theta, 'none');
imshow(rhead,[])
rhead = iradon(R_new, theta, 'Hann');
imshow(rhead,[])
imshow(rhead,[0,1000])
imshow(rhead,[0,100])
imshow(rhead,[0,500])
imshow(rhead,[0,400])
imshow(rhead,[0,300])
rhead = iradon(R_new, theta, 'Hamming');imshow(rhead,[])
rhead = iradon(R_new, theta, 'Cosine');imshow(rhead,[])
rhead = iradon(R_new, theta, 'Shepp-Logan');imshow(rhead,[])
rhead = iradon(R_new, theta, 'Ram-Lak');imshow(rhead,[])
rhead = iradon(R_new, theta, 'Cosine');imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine');imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine',1);imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine',0.7);imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine',0.5);imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine',0.3);imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine',0.1);imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine',0.2);imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine',0.25);imshow(rhead,[])
rhead = iradon(R_new, theta, 'pchip', 'Cosine',0.2);imshow(rhead,[])
rhead = iradon(R_new, theta, 'v5cubic', 'Cosine',0.2);imshow(rhead,[])
rhead = iradon(R_new, theta, 'v5cubic', 'Cosine',0.15);imshow(rhead,[])
rhead = iradon(R_new, theta, 'v5cubic', 'Cosine',0.2);imshow(rhead,[])
rhead = iradon(R_new, theta, 'v5cubic', 'Cosine',0.2,500);imshow(rhead,[])
rhead = iradon(R_new, theta, 'v5cubic', 'Cosine',0.2);imshow(rhead,[])